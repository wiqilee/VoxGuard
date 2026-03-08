"""
app.api.websocket
─────────────────
WebSocket endpoint for real-time scam detection sessions.
Now emits 'intervention' events when the threat engine determines
the user is about to take a fatal action (share OTP, transfer funds, etc).
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
                    response = engine.ingest_audio_result(result)

                    # Send alert if detected
                    if response["alert"]:
                        await ws.send_json(response["alert"])

                    # Send intervention if triggered
                    if response["intervention"]:
                        await ws.send_json(response["intervention"])
                        logger.warning(
                            f"[WS] INTERVENTION fired: {response['intervention']['intervention']['level']} "
                            f"— pattern: {response['intervention']['intervention']['pattern']}"
                        )

                # Periodic score update
                await ws.send_json(engine.score_update())

            elif msg_type == "screen_frame":
                result = await vision.process_frame(msg.get("data", ""))
                if result:
                    vis_msg = engine.ingest_vision_result(result)
                    if vis_msg:
                        await ws.send_json(vis_msg)

            elif msg_type == "intervention_response":
                # User responded to an intervention (dismissed, challenge result, safe exit)
                intervention_id = msg.get("intervention_id", "")
                user_action = msg.get("user_action", "dismissed")
                engine.record_intervention_action(intervention_id, user_action)
                logger.info(f"[WS] Intervention {intervention_id} response: {user_action}")

                # If user chose safe_exit, end the session
                if user_action == "safe_exit":
                    summary = engine.session_summary()
                    await ws.send_json(summary)
                    await ws.send_json({
                        "type": "session_end",
                        "reason": "safe_exit_intervention",
                        "threat_score": engine.session.threat_score,
                        "alerts_count": len(engine.session.alerts),
                    })

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
                    response = engine.ingest_audio_result(flush)
                    if response["alert"]:
                        await ws.send_json(response["alert"])
                    if response["intervention"]:
                        await ws.send_json(response["intervention"])

                # Send full session summary with intervention history
                summary = engine.session_summary()
                await ws.send_json(summary)

                await ws.send_json({
                    "type": "session_end",
                    "threat_score": engine.session.threat_score,
                    "alerts_count": len(engine.session.alerts),
                    "interventions_count": len(engine.session.interventions),
                })

    except WebSocketDisconnect:
        logger.info("[WS] Client disconnected")
    except Exception as e:
        logger.error(f"[WS] Error: {e}")
        try:
            await ws.send_json({"type": "error", "message": str(e)})
        except Exception:
            pass