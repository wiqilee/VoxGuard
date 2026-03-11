"""
VoxGuard FastAPI Backend v2.0
─────────────────────────────
Real-time AI-powered scam detection API with:
  - Natural voice intervention (Gemini TTS)
  - Multimodal explanation cards
  - Guided anti-scam action agent

Endpoints:
  WS  /ws/session       Real-time session (audio + screen + intervention + TTS)
  GET /health           Health check for Cloud Run
  GET /api/patterns     Scam pattern library as JSON
  GET /api/stats        Global stats
  GET /api/countries    Supported countries for action agent
"""

import logging
import json
import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.websocket import router as ws_router
from app.core.config import get_settings

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Real-time AI-powered scam detection with voice intervention. Gemini Live Agent Challenge 2026.",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ws_router)


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": settings.app_name,
        "version": settings.app_version,
        "features": ["tts", "explanation_cards", "action_agent"],
    }


@app.get("/api/patterns")
async def get_patterns():
    patterns_path = Path(__file__).parent.parent / "data" / "scam_patterns.json"
    if patterns_path.exists():
        return json.loads(patterns_path.read_text())
    return {"patterns": [], "count": 0}


@app.get("/api/stats")
async def get_stats():
    return {
        "patterns_count": 50,
        "data_sources": ["FTC Sentinel", "FBI IC3 2024", "GASA 2024", "MAS ScamShield", "ACCC ScamWatch"],
        "latency_ms": "<80",
        "model": settings.gemini_model,
        "tts_model": settings.gemini_tts_model,
        "features": {
            "voice_intervention": True,
            "explanation_cards": True,
            "action_agent": True,
            "supported_countries": 9,
        },
    }


@app.get("/api/countries")
async def get_countries():
    """Returns supported countries for the action agent."""
    from app.services.action_agent import COUNTRY_RESOURCES

    return {
        "countries": [
            {"code": code, "name": data["name"], "flag": data["flag"], "emergency": data["emergency"]}
            for code, data in COUNTRY_RESOURCES.items()
        ],
        "count": len(COUNTRY_RESOURCES),
    }


@app.on_event("startup")
async def startup():
    port = os.environ.get("PORT", settings.backend_port)
    logger.info(f"VoxGuard API v{settings.app_version} started on port {port}")
    logger.info(f"  Gemini model:  {settings.gemini_model}")
    logger.info(f"  Vision model:  {settings.gemini_vision_model}")
    logger.info(f"  TTS model:     {settings.gemini_tts_model}")
    logger.info(f"  CORS origins:  {settings.cors_origins_list}")
    logger.info(f"  Features:      Voice TTS, Explanation Cards, Action Agent")


@app.on_event("shutdown")
async def shutdown():
    logger.info("VoxGuard API shutting down")
