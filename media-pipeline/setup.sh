#!/usr/bin/env bash
# =============================================================================
#  AWS EC2 g5.xlarge · Ubuntu 24.04 Deep Learning AMI (PyTorch pre-installed)
#  Installs Wan2.1 + Security Training Video Pipeline, then starts FastAPI.
#
#  Usage:
#    chmod +x setup.sh && ./setup.sh
#
#  What this script does:
#    1. apt update + essential packages
#    2. Verify pre-installed PyTorch + CUDA (skips reinstall)
#    3. Clone Wan2.1 from GitHub
#    4. Install Wan2.1 + pipeline Python dependencies
#    5. Download Wan2.1-T2V-14B model weights from HuggingFace (~28 GB)
#    6. Ensure output directory exists
#    7. Start FastAPI server on port 8000
# =============================================================================
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WAN2_DIR="${REPO_DIR}/Wan2.1"
MODEL_DIR_14B="${WAN2_DIR}/models/Wan2.1-T2V-14B"
MODEL_DIR_1B="${WAN2_DIR}/models/Wan2.1-T2V-1.3B"
HF_REPO_14B="Wan-AI/Wan2.1-T2V-14B"
PYTHON="python3"
PIP="${PYTHON} -m pip"

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "  Security Training Video Pipeline — EC2 Setup"
echo "  Working directory: ${REPO_DIR}"
echo "════════════════════════════════════════════════════════════════"

# ---------------------------------------------------------------------------
# 1. System packages
# ---------------------------------------------------------------------------
echo ""
echo "=== [1/7] System packages ==="
sudo apt-get update -y
sudo apt-get install -y \
    git \
    wget \
    curl \
    ffmpeg \
    python3 \
    python3-venv \
    python3-pip \
    python3-dev \
    build-essential \
    libgl1

# ---------------------------------------------------------------------------
# 2. Verify pre-installed PyTorch + CUDA (Deep Learning AMI ships with both)
# ---------------------------------------------------------------------------
echo ""
echo "=== [2/7] Verify PyTorch + CUDA ==="
${PIP} install --upgrade pip --quiet
${PYTHON} -c "
import torch
print('PyTorch version :', torch.__version__)
print('CUDA available  :', torch.cuda.is_available())
if torch.cuda.is_available():
    print('GPU             :', torch.cuda.get_device_name(0))
else:
    print('WARNING: CUDA not detected — check instance type and driver install')
"

# ---------------------------------------------------------------------------
# 3. Clone Wan2.1
# ---------------------------------------------------------------------------
echo ""
echo "=== [3/7] Clone Wan2.1 ==="
if [ -d "${WAN2_DIR}/.git" ]; then
    echo "  Wan2.1 already present — pulling latest commits"
    git -C "${WAN2_DIR}" pull
else
    git clone https://github.com/Wan-Video/Wan2.1.git "${WAN2_DIR}"
fi

# ---------------------------------------------------------------------------
# 4. Install Python dependencies
# ---------------------------------------------------------------------------
echo ""
echo "=== [4/7] Install Python dependencies ==="
${PIP} install -r "${WAN2_DIR}/requirements.txt"
${PIP} install -r "${REPO_DIR}/requirements.txt"

# ---------------------------------------------------------------------------
# 5. Download Wan2.1-T2V-14B model weights (~28 GB)
# ---------------------------------------------------------------------------
echo ""
echo "=== [5/7] Download Wan2.1-T2V-14B weights from HuggingFace ==="
echo "  Target: ${MODEL_DIR_14B}"
echo "  This download can take 20-40 minutes depending on network speed."
echo ""

${PIP} install -q "huggingface_hub[cli]>=0.20.3"
mkdir -p "${MODEL_DIR_14B}"

huggingface-cli download "${HF_REPO_14B}" \
    --local-dir "${MODEL_DIR_14B}" \
    --repo-type model

echo "  14B weights download complete."

# Optional: also fetch 1.3B weights for local testing
if [ "${DOWNLOAD_1B:-false}" = "true" ]; then
    echo ""
    echo "  Fetching 1.3B weights (DOWNLOAD_1B=true) …"
    mkdir -p "${MODEL_DIR_1B}"
    huggingface-cli download "Wan-AI/Wan2.1-T2V-1.3B" \
        --local-dir "${MODEL_DIR_1B}" \
        --repo-type model
fi

# ---------------------------------------------------------------------------
# 6. Output directory
# ---------------------------------------------------------------------------
echo ""
echo "=== [6/7] Prepare output directory ==="
mkdir -p "${REPO_DIR}/output/videos"
echo "  ${REPO_DIR}/output/videos  — ready"

# ---------------------------------------------------------------------------
# 7. Start FastAPI server
# ---------------------------------------------------------------------------
echo ""
echo "=== [7/7] Start FastAPI server ==="
echo "  Binding to 0.0.0.0:8000"
echo "  Model:  Wan2.1-T2V-14B  (720p)"
echo "  Logs:   stdout"
echo ""
echo "  Open in browser:   http://<EC2-PUBLIC-IP>:8000/docs"
echo "  List videos:       http://<EC2-PUBLIC-IP>:8000/videos"
echo ""

cd "${REPO_DIR}"

WAN_MODEL_DIR="${MODEL_DIR_14B}" \
WAN_MODEL="t2v-14B" \
WAN_SIZE="1280*720" \
WAN_FRAME_NUM="81" \
uvicorn app:app \
    --host 0.0.0.0 \
    --port 8000 \
    --workers 1 \
    --timeout-keep-alive 600
