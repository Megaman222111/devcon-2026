#!/usr/bin/env python3
"""
Batch video generation for Alberta Basic Security Guard Training content.
Reads prompts.json and calls the Wan2.1 generate.py for each scenario.

Usage:
    python generate_batch.py --model 1.3B          # local test (480p)
    python generate_batch.py --model 14B            # production (720p)
    python generate_batch.py --model 14B --force    # re-generate existing
"""

import argparse
import json
import subprocess
import sys
import time
from pathlib import Path

# ---------------------------------------------------------------------------
# Model configuration
# ---------------------------------------------------------------------------
MODEL_CONFIGS = {
    "1.3B": {
        "task": "t2v-1.3B",
        "ckpt_dir": "./Wan2.1/models/Wan2.1-T2V-1.3B",
        "size": "832*480",
        "frame_num": "33",
        "description": "Wan2.1-T2V-1.3B  |  480p  (local test)",
    },
    "14B": {
        "task": "t2v-14B",
        "ckpt_dir": "./Wan2.1/models/Wan2.1-T2V-14B",
        "size": "1280*720",
        "frame_num": "81",
        "description": "Wan2.1-T2V-14B   |  720p  (production)",
    },
}

PROMPTS_FILE = Path(__file__).parent / "prompts.json"
OUTPUT_DIR = Path(__file__).parent / "output" / "videos"
WAN_SCRIPT = Path(__file__).parent / "Wan2.1" / "generate.py"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Batch-generate security training videos with Wan2.1"
    )
    parser.add_argument(
        "--model",
        choices=list(MODEL_CONFIGS.keys()),
        default="1.3B",
        help="Model variant to use (default: 1.3B for local testing)",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Re-generate videos that already exist in output/videos/",
    )
    parser.add_argument(
        "--ids",
        nargs="+",
        metavar="ID",
        help="Only generate specific scenario IDs (e.g. --ids fire_evacuation incident_report)",
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=42,
        help="Random seed for reproducibility (default: 42)",
    )
    return parser.parse_args()


def load_prompts(ids_filter: list[str] | None) -> list[dict]:
    if not PROMPTS_FILE.exists():
        sys.exit(f"[error] {PROMPTS_FILE} not found.")
    prompts = json.loads(PROMPTS_FILE.read_text(encoding="utf-8"))
    if ids_filter:
        missing = set(ids_filter) - {p["id"] for p in prompts}
        if missing:
            sys.exit(f"[error] Unknown scenario IDs: {', '.join(sorted(missing))}")
        prompts = [p for p in prompts if p["id"] in ids_filter]
    return prompts


def run_generation(
    scenario: dict,
    cfg: dict,
    out_path: Path,
    seed: int,
) -> tuple[bool, str]:
    """Invoke Wan2.1 generate.py and return (success, message)."""
    if not WAN_SCRIPT.exists():
        return False, f"Wan2.1 generate.py not found at {WAN_SCRIPT}"

    cmd = [
        sys.executable,
        str(WAN_SCRIPT),
        "--task", cfg["task"],
        "--size", cfg["size"],
        "--ckpt_dir", cfg["ckpt_dir"],
        "--frame_num", cfg["frame_num"],
        "--prompt", scenario["prompt"],
        "--save_file", str(out_path),
        "--base_seed", str(seed),
    ]

    t0 = time.monotonic()
    result = subprocess.run(cmd, capture_output=True, text=True)
    elapsed = time.monotonic() - t0

    if result.returncode != 0:
        err = (result.stderr or result.stdout or "no output").strip()
        return False, f"exit {result.returncode} after {elapsed:.0f}s — {err[:300]}"

    return True, f"completed in {elapsed:.0f}s  →  {out_path.name}"


def print_separator(char: str = "─", width: int = 70) -> None:
    print(char * width)


def main() -> None:
    args = parse_args()
    cfg = MODEL_CONFIGS[args.model]
    prompts = load_prompts(args.ids)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    print_separator("═")
    print(f"  Security Training Video Generator — Wan2.1 Batch")
    print(f"  Model   : {cfg['description']}")
    print(f"  Scenarios: {len(prompts)}")
    print(f"  Output  : {OUTPUT_DIR.resolve()}")
    print_separator("═")

    results: dict[str, list[str]] = {"success": [], "skipped": [], "failed": []}

    for idx, scenario in enumerate(prompts, start=1):
        sid = scenario["id"]
        scene = scenario["scene"]
        out_path = OUTPUT_DIR / f"{sid}.mp4"

        print(f"\n[{idx:>2}/{len(prompts)}] {scene}")
        print_separator()

        if out_path.exists() and not args.force:
            size_mb = out_path.stat().st_size / (1024 * 1024)
            print(f"  ↷  Skipping — {out_path.name} already exists ({size_mb:.1f} MB)")
            results["skipped"].append(sid)
            continue

        print(f"  ▶  Generating …")
        success, msg = run_generation(scenario, cfg, out_path, args.seed)

        if success:
            print(f"  ✓  {msg}")
            results["success"].append(sid)
        else:
            print(f"  ✗  Failed: {msg}", file=sys.stderr)
            results["failed"].append(sid)

    # Summary
    total = len(prompts)
    print("\n")
    print_separator("═")
    print("  SUMMARY")
    print_separator()
    print(f"  Total    : {total}")
    print(f"  Success  : {len(results['success']):<3}  {results['success']}")
    print(f"  Skipped  : {len(results['skipped']):<3}  {results['skipped']}")
    print(f"  Failed   : {len(results['failed']):<3}  {results['failed']}")
    print_separator("═")

    if results["failed"]:
        sys.exit(1)


if __name__ == "__main__":
    main()
