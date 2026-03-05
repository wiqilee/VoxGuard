"""
app.api.websocket
─────────────────
WebSocket endpoint for real-time scam detection sessions.
"""

import json
import logging

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.services.threat_engine import ThreatEngine
from app.services.audio_analyzer import AudioAnalyzerService
from app.services.vision_analyzer import VisionAnalyzerService

logger = logging.getLogger(__name__)
router = APIRouter()


@router.websocket("/ws/session")
async def session_ws(ws: WebSocket):
    await ws.accept()
    logger.info("[WS] Client connected")

    engine = ThreatEngine()
    audio = AudioAnalyzerService()
    vision = VisionAnalyzerService()

    # Send session start
    await ws.send_json({
        "type": "session_start",
        "session_id": engine.session.session_id,
    })

    try:
        while True:
            raw = await ws.receive_text()
            msg = json.loads(raw)
            msg_type = msg.get("type")

            if msg_type == "audio_chunk":
                result = await audio.process_chunk(msg.get("data", ""))
                if result:
                    alert_msg = engine.ingest_audio_result(result)
                    if alert_msg:
                        await ws.send_json(alert_msg)
                # Periodic score update
                await ws.send_json(engine.score_update())

            elif msg_type == "screen_frame":
                result = await vision.process_frame(msg.get("data", ""))
                if result:
                    vis_msg = engine.ingest_vision_result(result)
                    if vis_msg:
                        await ws.send_json(vis_msg)

            elif msg_type == "start_session":
                engine = ThreatEngine()
                audio = AudioAnalyzerService()
                vision = VisionAnalyzerService()
                await ws.send_json({
                    "type": "session_start",
                    "session_id": engine.session.session_id,
                })

            elif msg_type == "end_session":
                flush = await audio.force_flush()
                if flush:
                    alert_msg = engine.ingest_audio_result(flush)
                    if alert_msg:
                        await ws.send_json(alert_msg)
                await ws.send_json({
                    "type": "session_end",
                    "threat_score": engine.session.threat_score,
                    "alerts_count": len(engine.session.alerts),
                })

    except WebSocketDisconnect:
        logger.info("[WS] Client disconnected")
    except Exception as e:
        logger.error(f"[WS] Error: {e}")
        try:
            await ws.send_json({"type": "error", "message": str(e)})
        except:
            pass
