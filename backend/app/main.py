"""
main.py
───────
Scam Shield FastAPI backend entry point.

Endpoints:
  WS  /ws/session     — Real-time session (audio + screen analysis)
  GET /health         — Health check for Cloud Run
  GET /api/patterns   — Serve scam pattern library as JSON
  GET /api/stats      — Global stats (for demo)
"""

import logging
import json
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.websocket import router as ws_router
from app.core.config   import get_settings

# ── Logging ───────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

# ── App factory ───────────────────────────────────────────────
settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Real-time AI-powered scam detection — Gemini Live Agent Challenge 2026",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ──────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────
app.include_router(ws_router)


# ── REST endpoints ────────────────────────────────────────────
@app.get("/health")
async def health():
    """Cloud Run health check."""
    return {
        "status":  "healthy",
        "service": settings.app_name,
        "version": settings.app_version,
    }


@app.get("/api/patterns")
async def get_patterns():
    """Return scam pattern library from data file."""
    patterns_path = Path(__file__).parent.parent / "data" / "scam_patterns.json"
    if patterns_path.exists():
        return json.loads(patterns_path.read_text())
    return {"patterns": [], "count": 0}


@app.get("/api/stats")
async def get_stats():
    """Global statistics for the about page."""
    return {
        "patterns_count": 50,
        "data_sources": ["FTC Sentinel", "FBI IC3 2024", "GASA 2024", "MAS ScamShield", "ACCC ScamWatch"],
        "latency_ms": "<80",
        "model": settings.gemini_model,
    }


@app.on_event("startup")
async def startup():
    logger.info(f"🛡  Scam Shield API v{settings.app_version} started")
    logger.info(f"    Gemini model: {settings.gemini_model}")
    logger.info(f"    CORS origins: {settings.cors_origins_list}")


@app.on_event("shutdown")
async def shutdown():
    logger.info("🛡  Scam Shield API shutting down")
