#!/bin/bash
# ==============================================================================
# Raze Engine - AMD Developer Cloud (AAC) Deployment Script
# ==============================================================================
# This script builds and deploys the Raze Engine on an AMD Accelerator Cloud node.
# It uses the dedicated Dockerfile.rocm to ensure native PyTorch support on 
# AMD Instinct GPUs (MI210/MI300X) and maps the required /dev/kfd and /dev/dri 
# devices into the container.

echo "=========================================================="
echo "    Deploying Raze Engine on AMD Developer Cloud (AAC)    "
echo "=========================================================="

echo "[1/3] Building ROCm PyTorch Docker Image (raze-engine-rocm)..."
docker build -t raze-engine-rocm -f Dockerfile.rocm .

echo "[2/3] Checking for existing containers..."
docker rm -f raze-engine-cloud 2>/dev/null

echo "[3/3] Booting AMD Hardware-Accelerated Container..."
# The --device flags are CRITICAL for exposing the AMD GPU to the container
docker run -d \
  --name raze-engine-cloud \
  --network host \
  --device=/dev/kfd \
  --device=/dev/dri \
  --group-add video \
  --ipc=host \
  --cap-add=SYS_PTRACE \
  --security-opt seccomp=unconfined \
  raze-engine-rocm

echo "=========================================================="
echo "Deployment Complete!"
echo "Verify AMD GPU visibility by running:"
echo "  docker exec -it raze-engine-cloud rocm-smi"
echo "=========================================================="
