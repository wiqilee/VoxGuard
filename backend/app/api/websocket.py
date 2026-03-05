"""
websocket.py
────────────
The real-time WebSocket endpoint.

Message protocol (JSON):
  Client → Server:
    { "type": "start_session" }
    { "type": "audio_chunk", "data": "<base64 PCM>", "timestamp": 1234567890 }
    { "type": "screen_frame", "data": "<base64 JPEG>", "timestamp": 1234567890 }
    { "type": "end_session" }

  Server → Client:
    { "type": "session_start", "session_id": "ABC12345" }
    { "type": "threat_alert", "alert": {...}, "threat_score": 85, ... }
    { "type": "score_update", "threat_score": 45, ... }
    { "type": "visual_threat", ... }
    { "type": "session_end", "summary": {...} }
    { "type": "error", "message": "..." }
"""

import asyncio
import json
import logging

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.services.threat_engine   import ThreatEngine
from app.services.audio_analyzer  import AudioAnalyzerService
from app.core.gemini_client        import get_vision_analyzer

logger = logging.getLogger(__name__)
router = APIRouter()

# Score updates are sent every N audio chunks to avoid flooding the client
SCORE_UPDATE_EVERY = 8


@router.websocket("/ws/session")
async def websocket_session(ws: WebSocket):
    await ws.accept()
    logger.info("WebSocket session opened")

    engine         = ThreatEngine()
    audio_service  = AudioAnalyzerService()
    vision_service = get_vision_analyzer()
    chunk_counter  = 0

    try:
        # ── Send session start ────────────────────────────────
        await ws.send_json({
            "type":       "session_start",
            "session_id": engine.session.session_id,
        })

        while True:
            # ── Receive message ───────────────────────────────
            raw = await asyncio.wait_for(ws.receive_text(), timeout=60.0)
            msg = json.loads(raw)
            msg_type = msg.get("type")

            # ── Audio chunk ───────────────────────────────────
            if msg_type == "audio_chunk":
                chunk_counter += 1
                audio_data = msg.get("data", "")

                # Run audio analysis
                gemini_result = await audio_service.process_chunk(audio_data)
                if gemini_result:
                    alert_msg = engine.ingest_audio_result(gemini_result)
                    if alert_msg:
                        await ws.send_json(alert_msg)
                        logger.info(f"Alert sent: {alert_msg['alert']['pattern']}")

                # Periodic score update (non-alert)
                if chunk_counter % SCORE_UPDATE_EVERY == 0:
                    await ws.send_json(engine.score_update())

            # ── Screen frame ──────────────────────────────────
            elif msg_type == "screen_frame":
                frame_data    = msg.get("data", "")
                vision_result = await vision_service.analyze_frame(frame_data)
                if vision_result:
                    visual_msg = engine.ingest_vision_result(vision_result)
                    if visual_msg:
                        await ws.send_json(visual_msg)

            # ── Session control ───────────────────────────────
            elif msg_type == "start_session":
                logger.info(f"Session {engine.session.session_id} started")

            elif msg_type == "end_session":
                # Flush remaining audio buffer
                final_result = await audio_service.force_flush()
                if final_result:
                    alert_msg = engine.ingest_audio_result(final_result)
                    if alert_msg:
                        await ws.send_json(alert_msg)

                # Send session summary
                s = engine.session
                await ws.send_json({
                    "type": "session_end",
                    "summary": {
                        "session_id":    s.session_id,
                        "duration":      s.session_seconds,
                        "alerts_count":  len(s.alerts),
                        "threat_score":  s.threat_score,
                        "threat_level":  s.threat_level,
                        "psych_scores":  s.psych_scores,
                        "patterns_hit":  list(s.detected_patterns),
                    },
                })
                logger.info(f"Session {s.session_id} ended: {len(s.alerts)} alerts, score={s.threat_score}")
                break

    except WebSocketDisconnect:
        logger.info("Client disconnected")

    except asyncio.TimeoutError:
        logger.warning("WebSocket timeout — no messages for 60s")
        try:
            await ws.send_json({"type": "error", "message": "Session timeout"})
        except Exception:
            pass

    except Exception as e:
        logger.error(f"WebSocket error: {e}", exc_info=True)
        try:
            await ws.send_json({"type": "error", "message": str(e)})
        except Exception:
            pass

    finally:
        try:
            await ws.close()
        except Exception:
            pass
        logger.info("WebSocket session closed")
