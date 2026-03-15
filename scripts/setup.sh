#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# setup.sh — One-command local development setup for Scam Shield
# Usage: chmod +x scripts/setup.sh && ./scripts/setup.sh
# ─────────────────────────────────────────────────────────────
set -euo pipefail

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${CYAN}[ScamShield]${NC} $1"; }
ok()   { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err()  { echo -e "${RED}[✗]${NC} $1"; exit 1; }

log "Setting up VoxGuard development environment..."
echo ""

# ── Check prerequisites ───────────────────────────────────────
log "Checking prerequisites..."

command -v node   >/dev/null 2>&1 || err "Node.js not found. Install: https://nodejs.org (v20+)"
command -v python3 >/dev/null 2>&1 || err "Python not found. Install: https://python.org (3.11+)"
command -v rustc  >/dev/null 2>&1 || err "Rust not found. Install: https://rustup.rs"

NODE_VER=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
[[ "$NODE_VER" -ge 18 ]] || err "Node.js 18+ required (found v$NODE_VER)"

PYTHON_VER=$(python3 --version | awk '{print $2}' | cut -d'.' -f2)
[[ "$PYTHON_VER" -ge 11 ]] || warn "Python 3.11+ recommended for best compatibility"

ok "All prerequisites found"
echo ""

# ── Environment file ──────────────────────────────────────────
log "Setting up environment..."
if [ ! -f .env ]; then
    cp .env.example .env
    ok "Created .env from .env.example"
    warn "Edit .env and add your GOOGLE_API_KEY before running the backend"
else
    ok ".env already exists"
fi
echo ""

# ── Build Rust WASM engine ────────────────────────────────────
if command -v wasm-pack >/dev/null 2>&1; then
    log "Building Rust WASM audio engine..."
    cd rust-engine
    wasm-pack build --target web --out-dir ../frontend/src/wasm --release 2>&1 | tail -5
    cd ..
    ok "Rust WASM engine built → frontend/src/wasm/"
else
    warn "wasm-pack not found. Skipping Rust build (Web Audio fallback will be used)"
    warn "Install wasm-pack: curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh"
fi
echo ""

# ── Frontend ──────────────────────────────────────────────────
log "Installing frontend dependencies..."
cd frontend
npm install --silent
ok "Frontend dependencies installed"
cd ..
echo ""

# ── Backend ───────────────────────────────────────────────────
log "Setting up Python virtual environment..."
cd backend
python3 -m venv venv
source venv/bin/activate
pip install --quiet --upgrade pip
pip install --quiet -r requirements.txt
ok "Backend dependencies installed"
deactivate
cd ..
echo ""

# ── Done ──────────────────────────────────────────────────────
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  🛡  VoxGuard complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "  Start backend:    cd backend && source venv/bin/activate && uvicorn app.main:app --reload"
echo "  Start frontend:   cd frontend && npm run dev"
echo "  Open browser:     http://localhost:5173"
echo ""
echo "  For demo mode (no backend): VITE_DEMO_MODE=true npm run dev"
echo ""
