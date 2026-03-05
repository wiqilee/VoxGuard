#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# deploy.sh — Automated Google Cloud Run deployment
# Usage: chmod +x scripts/deploy.sh && ./scripts/deploy.sh
# ─────────────────────────────────────────────────────────────
set -euo pipefail

CYAN='\033[0;36m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
log()  { echo -e "${CYAN}[Deploy]${NC} $1"; }
ok()   { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err()  { echo -e "${RED}[✗]${NC} $1"; exit 1; }

# ── Load environment ──────────────────────────────────────────
[ -f .env ] && source .env

PROJECT_ID=${GOOGLE_CLOUD_PROJECT:-""}
REGION=${GCP_REGION:-"us-central1"}
SERVICE_NAME="scam-shield-backend"
IMAGE="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

[ -z "$PROJECT_ID" ] && err "GOOGLE_CLOUD_PROJECT not set in .env"
[ -z "$GOOGLE_API_KEY" ] && err "GOOGLE_API_KEY not set in .env"

log "Deploying Scam Shield to Google Cloud Run"
log "Project:  $PROJECT_ID"
log "Region:   $REGION"
log "Service:  $SERVICE_NAME"
echo ""

# ── Authenticate ──────────────────────────────────────────────
log "Authenticating with Google Cloud..."
gcloud config set project "$PROJECT_ID"
gcloud auth configure-docker --quiet
ok "Authenticated"

# ── Enable required APIs ──────────────────────────────────────
log "Enabling required GCP APIs..."
gcloud services enable \
    run.googleapis.com \
    containerregistry.googleapis.com \
    firestore.googleapis.com \
    storage.googleapis.com \
    aiplatform.googleapis.com \
    --quiet
ok "APIs enabled"

# ── Build Rust WASM ───────────────────────────────────────────
if command -v wasm-pack >/dev/null 2>&1; then
    log "Building Rust WASM engine..."
    cd rust-engine && wasm-pack build --target web --out-dir ../frontend/src/wasm --release && cd ..
    ok "WASM built"
fi

# ── Build frontend ────────────────────────────────────────────
log "Building frontend for production..."
cd frontend
VITE_DEMO_MODE=false VITE_WS_URL="wss://${SERVICE_NAME}-${PROJECT_ID}.run.app/ws/session" npm run build
ok "Frontend built → frontend/dist/"
cd ..

# ── Build and push Docker image ───────────────────────────────
log "Building Docker image..."
docker build -t "$IMAGE:latest" ./backend
ok "Image built: $IMAGE:latest"

log "Pushing image to Container Registry..."
docker push "$IMAGE:latest"
ok "Image pushed"

# ── Deploy to Cloud Run ───────────────────────────────────────
log "Deploying to Cloud Run..."
gcloud run deploy "$SERVICE_NAME" \
    --image "$IMAGE:latest" \
    --platform managed \
    --region "$REGION" \
    --allow-unauthenticated \
    --memory 512Mi \
    --cpu 1 \
    --concurrency 80 \
    --timeout 300 \
    --set-env-vars "GOOGLE_API_KEY=${GOOGLE_API_KEY},GOOGLE_CLOUD_PROJECT=${PROJECT_ID}" \
    --quiet

SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" \
    --platform managed --region "$REGION" \
    --format "value(status.url)")

ok "Backend deployed: $SERVICE_URL"

# ── Deploy frontend to Firebase Hosting (optional) ───────────
if command -v firebase >/dev/null 2>&1; then
    log "Deploying frontend to Firebase Hosting..."
    cd frontend && firebase deploy --only hosting --quiet && cd ..
    ok "Frontend deployed"
else
    warn "Firebase CLI not found. Deploy frontend/dist/ manually to Vercel or Firebase."
    warn "For Vercel: push to GitHub and connect the repo at vercel.com"
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  🛡  Scam Shield deployed!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "  Backend URL:   $SERVICE_URL"
echo "  Health check:  $SERVICE_URL/health"
echo "  API docs:      $SERVICE_URL/docs"
echo ""
