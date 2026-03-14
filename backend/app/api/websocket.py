"""
app.api.websocket
-----------------
WebSocket endpoint for real-time scam detection sessions.

v4 fix: Added keepalive ping to prevent Cloud Run idle timeout.
Only sends score_update when threat_score actually changes,
not on every audio chunk.
"""

import asyncio
import json
import logging
import time

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.services.threat_engine import ThreatEngine
from app.services.audio_analyzer import AudioAnalyzerService
from app.services.vision_analyzer import VisionAnalyzerService
from app.services.tts_service import TTSService
from app.services.explanation_service import ExplanationService
from app.services.action_agent import ActionAgentService

logger = logging.getLogger(__name__)
router = APIRouter()

# Keepalive interval (seconds) - must be less than Cloud Run request timeout
KEEPALIVE_INTERVAL = 30


@router.websocket("/ws/session")
async def session_ws(ws: WebSocket):
    await ws.accept()
    logger.info("[WS] Client connected")

    engine = ThreatEngine()
    audio = AudioAnalyzerService()
    vision = VisionAnalyzerService()
    tts = TTSService()
    explainer = ExplanationService()
    action_agent = ActionAgentService()

    session_language = "en"
    session_country = "US"
    last_vision_result = None
    transcript_context = ""
    last_sent_score = -1
    last_score_time = 0

    # Background keepalive to prevent Cloud Run idle timeout
    keepalive_task = None

    async def _keepalive():
        """Send periodic ping to keep WebSocket alive on Cloud Run."""
        try:
            while True:
                await asyncio.sleep(KEEPALIVE_INTERVAL)
                try:
                    await ws.send_json({"type": "ping", "ts": time.time()})
                except Exception:
                    break
        except asyncio.CancelledError:
            pass

    keepalive_task = asyncio.create_task(_keepalive())

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

                    if result.get("transcript"):
                        transcript_context += " " + result["transcript"]
                        if len(transcript_context) > 500:
                            transcript_context = transcript_context[-500:]

                    # Send alert if detected
                    if response["alert"]:
                        await ws.send_json(response["alert"])

                        # Generate explanation card for high-severity alerts
                        alert_data = response["alert"].get("alert", {})
                        if alert_data.get("severity") in ("critical", "high"):
                            try:
                                explanation = await explainer.generate_explanation(
                                    alert=alert_data,
                                    transcript_context=transcript_context,
                                    screenshot_analysis=last_vision_result,
                                    psych_scores=engine.session.psych_scores,
                                    lie_scores=engine.session.lie_scores,
                                    language=session_language,
                                )
                                if explanation:
                                    await ws.send_json({
                                        "type": "explanation_card",
                                        "explanation": explanation,
                                    })
                            except Exception as e:
                                logger.error(f"[WS] Explanation error: {e}")

                    # Send intervention if triggered
                    if response["intervention"]:
                        intervention = response["intervention"]
                        await ws.send_json(intervention)

                        int_data = intervention.get("intervention", {})
                        logger.warning(
                            f"[WS] INTERVENTION fired: {int_data.get('level')} "
                            f"-- pattern: {int_data.get('pattern')}"
                        )

                        try:
                            tts_result = await tts.generate_intervention_audio(
                                level=int_data.get("level", "WARN"),
                                pattern=int_data.get("pattern", ""),
                                language=session_language,
                            )
                            if tts_result:
                                await ws.send_json({
                                    "type": "intervention_audio",
                                    "intervention_id": int_data.get("id"),
                                    "audio_base64": tts_result.get("audio_base64"),
                                    "audio_mime": tts_result.get("audio_mime", "audio/wav"),
                                    "script_text": tts_result.get("script_text", ""),
                                    "fallback": tts_result.get("fallback"),
                                })
                        except Exception as e:
                            logger.error(f"[WS] TTS error: {e}")

                # Only send score_update when score actually changed OR every 5 seconds
                current_score = engine.session.threat_score
                now = time.time()
                if current_score != last_sent_score or (now - last_score_time > 5.0):
                    if current_score != last_sent_score:
                        logger.info(f"[WS] Score update: {last_sent_score} -> {current_score}")
                    await ws.send_json(engine.score_update())
                    last_sent_score = current_score
                    last_score_time = now

            elif msg_type == "screen_frame":
                result = await vision.process_frame(msg.get("data", ""))
                if result:
                    last_vision_result = result
                    vis_msg = engine.ingest_vision_result(result)
                    if vis_msg:
                        await ws.send_json(vis_msg)

            elif msg_type == "intervention_response":
                intervention_id = msg.get("intervention_id", "")
                user_action = msg.get("user_action", "dismissed")
                engine.record_intervention_action(intervention_id, user_action)
                logger.info(f"[WS] Intervention {intervention_id} response: {user_action}")

                if user_action == "safe_exit":
                    try:
                        plan = action_agent.generate_action_plan(
                            scam_pattern=msg.get("pattern", "Unknown"),
                            severity=msg.get("severity", "high"),
                            country_code=session_country,
                            threat_score=engine.session.threat_score,
                            compromised_info=msg.get("compromised_info", []),
                            interventions=[
                                {
                                    "level": e.level,
                                    "trigger": e.trigger,
                                    "pattern": e.pattern,
                                    "user_action": e.user_action,
                                }
                                for e in engine.session.interventions
                            ],
                        )
                        plan = await action_agent.generate_ai_enhanced_plan(
                            base_plan=plan,
                            transcript_summary=transcript_context,
                        )
                        await ws.send_json(plan)
                    except Exception as e:
                        logger.error(f"[WS] Action plan error: {e}")

                    summary = engine.session_summary()
                    await ws.send_json(summary)
                    await ws.send_json({
                        "type": "session_end",
                        "reason": "safe_exit_intervention",
                        "threat_score": engine.session.threat_score,
                        "alerts_count": len(engine.session.alerts),
                    })

            elif msg_type == "set_language":
                session_language = msg.get("language", "en")
                session_country = msg.get("country", "US")
                logger.info(f"[WS] Language set to {session_language}, country: {session_country}")

            elif msg_type == "start_session":
                engine = ThreatEngine()
                audio = AudioAnalyzerService()
                vision = VisionAnalyzerService()
                transcript_context = ""
                last_vision_result = None
                last_sent_score = -1
                last_score_time = 0

                session_language = msg.get("language", session_language)
                session_country = msg.get("country", session_country)

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

                if engine.session.threat_score >= 30 and engine.session.alerts:
                    try:
                        top_alert = engine.session.alerts[-1]
                        plan = action_agent.generate_action_plan(
                            scam_pattern=top_alert.pattern,
                            severity=top_alert.severity,
                            country_code=session_country,
                            threat_score=engine.session.threat_score,
                            interventions=[
                                {
                                    "level": e.level,
                                    "trigger": e.trigger,
                                    "pattern": e.pattern,
                                    "user_action": e.user_action,
                                }
                                for e in engine.session.interventions
                            ],
                        )
                        plan = await action_agent.generate_ai_enhanced_plan(
                            base_plan=plan,
                            transcript_summary=transcript_context,
                        )
                        await ws.send_json(plan)
                    except Exception as e:
                        logger.error(f"[WS] End session action plan error: {e}")

                summary = engine.session_summary()
                await ws.send_json(summary)

                await ws.send_json({
                    "type": "session_end",
                    "threat_score": engine.session.threat_score,
                    "alerts_count": len(engine.session.alerts),
                    "interventions_count": len(engine.session.interventions),
                })

            elif msg_type == "request_action_plan":
                try:
                    pattern = msg.get("pattern", "Unknown")
                    if engine.session.alerts:
                        pattern = engine.session.alerts[-1].pattern

                    plan = action_agent.generate_action_plan(
                        scam_pattern=pattern,
                        severity=msg.get("severity", "high"),
                        country_code=msg.get("country", session_country),
                        threat_score=engine.session.threat_score,
                        compromised_info=msg.get("compromised_info", []),
                        interventions=[
                            {
                                "level": e.level,
                                "trigger": e.trigger,
                                "pattern": e.pattern,
                                "user_action": e.user_action,
                            }
                            for e in engine.session.interventions
                        ],
                    )
                    await ws.send_json(plan)
                except Exception as e:
                    logger.error(f"[WS] Action plan request error: {e}")

            elif msg_type in ("pong", "ping"):
                # Keepalive response from frontend, ignore silently
                pass

    except WebSocketDisconnect:
        logger.info("[WS] Client disconnected")
    except Exception as e:
        logger.error(f"[WS] Error: {e}")
        try:
            await ws.send_json({"type": "error", "message": str(e)})
        except Exception:
            pass
    finally:
        if keepalive_task:
            keepalive_task.cancel()
            try:
                await keepalive_task
            except asyncio.CancelledError:
                pass
