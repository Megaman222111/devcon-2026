"""
FastAPI server for on-demand security training video generation via Wan2.1.

Startup: uvicorn app:app --host 0.0.0.0 --port 8000

Environment variables (all optional):
    WAN_MODEL_DIR   Path to model weights  (default: ./Wan2.1/models/Wan2.1-T2V-14B)
    WAN_MODEL       Task name              (default: t2v-14B)
    WAN_SIZE        Output resolution      (default: 1280*720)
    WAN_FRAME_NUM   Frames per clip        (default: 81)
"""

import asyncio
import json
import os
import sys
import uuid
from concurrent.futures import ThreadPoolExecutor
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
_HERE = Path(__file__).parent
WAN2_DIR = _HERE / "Wan2.1"
sys.path.insert(0, str(WAN2_DIR))

MODEL_DIR = os.environ.get("WAN_MODEL_DIR", str(_HERE / "Wan2.1" / "models" / "Wan2.1-T2V-14B"))
MODEL_NAME = os.environ.get("WAN_MODEL", "t2v-14B")
OUTPUT_SIZE = os.environ.get("WAN_SIZE", "1280*720")
FRAME_NUM = int(os.environ.get("WAN_FRAME_NUM", "81"))
OUTPUT_DIR = _HERE / "output" / "videos"
PROMPTS_FILE = _HERE / "prompts.json"

# ---------------------------------------------------------------------------
# Global state
# ---------------------------------------------------------------------------
_pipeline: Optional[Any] = None
_executor = ThreadPoolExecutor(max_workers=1)   # one GPU job at a time
jobs: Dict[str, Dict] = {}                       # in-memory job store


# ---------------------------------------------------------------------------
# Lifespan: load model once at startup
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    global _pipeline

    print(f"[startup] Loading Wan2.1 ({MODEL_NAME}) from {MODEL_DIR} …")
    try:
        import wan
        from wan.configs import WAN_CONFIGS

        cfg = WAN_CONFIGS[MODEL_NAME]
        _pipeline = wan.WanT2V(
            config=cfg,
            checkpoint_dir=MODEL_DIR,
            device_id=0,
            rank=0,
            t5_fsdp=False,
            dit_fsdp=False,
            use_usp=False,
        )
        print("[startup] Model loaded and ready.")
    except Exception as exc:
        print(f"[startup] WARNING: model failed to load — {exc}")
        print("[startup] /generate will return 503 until model is available.")
        _pipeline = None

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    yield

    _pipeline = None
    _executor.shutdown(wait=False)


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Security Training Video Generator",
    description="Generates Alberta Basic Security Guard Training videos via Wan2.1.",
    version="1.0.0",
    lifespan=lifespan,
)


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------
class GenerateRequest(BaseModel):
    prompt: str
    scene_id: str
    seed: int = 42


class JobStatus(BaseModel):
    job_id: str
    status: str               # processing | done | failed
    scene_id: Optional[str] = None
    video_url: Optional[str] = None
    error: Optional[str] = None


# ---------------------------------------------------------------------------
# Background generation (runs in thread pool, not async event loop)
# ---------------------------------------------------------------------------
def _save_video(frames: Any, out_path: Path) -> None:
    """Save a Wan2.1 output tensor to an MP4 file."""
    try:
        from wan.utils.utils import cache_video      # preferred: wan's own writer
        cache_video(
            tensor=frames[None],                     # add batch dim
            save_file=str(out_path),
            fps=16,
            nrow=1,
            normalize=True,
            value_range=(-1, 1),
        )
    except (ImportError, AttributeError):
        import imageio                               # fallback: imageio + ffmpeg
        import numpy as np

        # frames tensor: (T, C, H, W), float32, range [-1, 1]
        frames_np = frames.cpu().float().numpy().transpose(0, 2, 3, 1)
        frames_np = ((frames_np * 0.5 + 0.5) * 255).clip(0, 255).astype("uint8")
        imageio.mimwrite(str(out_path), frames_np, fps=16, codec="h264")


def _run_generation(job_id: str, prompt: str, scene_id: str, seed: int) -> None:
    """Executed in a ThreadPoolExecutor worker — never called on the async loop."""
    global jobs

    out_path = OUTPUT_DIR / f"{scene_id}.mp4"

    if _pipeline is None:
        jobs[job_id] = {"status": "failed", "error": "Model not loaded."}
        return

    try:
        from wan.configs import SIZE_CONFIGS

        frames = _pipeline.generate(
            prompt,
            size=SIZE_CONFIGS[OUTPUT_SIZE],
            frame_num=FRAME_NUM,
            shift=5.0,
            sample_solver="unipc",
            sampling_steps=50,
            guide_scale=5.0,
            seed=seed,
            offload_model=True,
        )

        _save_video(frames, out_path)

        jobs[job_id] = {
            "status": "done",
            "scene_id": scene_id,
            "video_url": f"/video/{scene_id}.mp4",
        }

    except Exception as exc:
        jobs[job_id] = {"status": "failed", "error": str(exc)}


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.post("/generate", response_model=JobStatus, status_code=202)
async def generate(req: GenerateRequest) -> Dict:
    """Kick off video generation as a background task. Returns a job_id to poll."""
    if _pipeline is None:
        raise HTTPException(status_code=503, detail="Model not loaded — check server logs.")

    job_id = str(uuid.uuid4())
    jobs[job_id] = {"status": "processing", "scene_id": req.scene_id}

    loop = asyncio.get_event_loop()
    loop.run_in_executor(
        _executor,
        _run_generation,
        job_id, req.prompt, req.scene_id, req.seed,
    )

    return {"job_id": job_id, "status": "processing", "scene_id": req.scene_id}


@app.get("/status/{job_id}", response_model=JobStatus)
async def get_status(job_id: str) -> Dict:
    """Poll job status. Returns processing | done (with video_url) | failed."""
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found.")
    return {"job_id": job_id, **jobs[job_id]}


@app.get("/video/{filename}")
async def serve_video(filename: str) -> FileResponse:
    """Download or stream a generated MP4 file."""
    if ".." in filename or not filename.endswith(".mp4"):
        raise HTTPException(status_code=400, detail="Invalid filename.")
    video_path = OUTPUT_DIR / filename
    if not video_path.exists():
        raise HTTPException(status_code=404, detail="Video not found.")
    return FileResponse(str(video_path), media_type="video/mp4")


@app.get("/videos")
async def list_videos() -> List[Dict]:
    """List all generated videos with their human-readable scene names."""
    scene_map: Dict[str, str] = {}
    if PROMPTS_FILE.exists():
        prompts_data = json.loads(PROMPTS_FILE.read_text(encoding="utf-8"))
        scene_map = {p["id"]: p["scene"] for p in prompts_data}

    videos = []
    for f in sorted(OUTPUT_DIR.glob("*.mp4")):
        videos.append({
            "filename": f.name,
            "scene": scene_map.get(f.stem, f.stem),
            "url": f"/video/{f.name}",
            "size_bytes": f.stat().st_size,
        })
    return videos


@app.get("/health")
async def health() -> Dict:
    return {"status": "ok", "model_loaded": _pipeline is not None}


# ---------------------------------------------------------------------------
# Entry point for direct execution
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=False)
