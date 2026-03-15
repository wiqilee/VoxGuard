#!/bin/bash
set -e

echo "=== VoxGuard Deploy ==="

# Build WASM
echo "[1/4] Building Rust WASM..."
cd rust-engine
wasm-pack build --target web --out-dir ../frontend/src/wasm
cd ..

# Build frontend
echo "[2/4] Building frontend..."
cd frontend
npm install
npm run build
cd ..

# Deploy backend to Cloud Run
echo "[3/4] Deploying backend to Cloud Run..."
cd backend
gcloud run deploy voxguard-backend \
  --source . \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10
cd ..

echo "[4/4] Done! Backend deployed to Cloud Run."
echo "Frontend: deploy via Vercel (auto on push)"
