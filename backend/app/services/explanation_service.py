"""
app.services.explanation_service
─────────────────────────────────
Generates multimodal explanation cards that combine audio transcript
analysis with screenshot analysis into a clear, human-readable
explanation of why VoxGuard flagged a threat.

Example output:
  "The caller claimed to be from your bank's fraud department (Authority tactic)
   while your screen shows a fake login page at 'bank-secure-verify.com'
   (not your real bank's domain). Combined confidence: 96%."

Uses Gemini to synthesize both signals into a single explanation.
"""

import json
import logging
from typing import Optional

from app.core.config import get_settings

logger = logging.getLogger(__name__)
_settings = get_settings()


class ExplanationService:
    """Generates contextual explanation cards from multimodal signals."""

    def __init__(self):
        self._model = None
        self._init_model()

    def _init_model(self):
        if not _settings.google_api_key:
            return
        try:
            import google.generativeai as genai

            genai.configure(api_key=_settings.google_api_key)
            self._model = genai.GenerativeModel(_settings.gemini_vision_model)
            logger.info("[ExplanationService] Model ready")
        except Exception as e:
            logger.error(f"[ExplanationService] Init failed: {e}")

    async def generate_explanation(
        self,
        alert: dict,
        transcript_context: str = "",
        screenshot_analysis: Optional[dict] = None,
        psych_scores: Optional[dict] = None,
        lie_scores: Optional[dict] = None,
        language: str = "en",
    ) -> Optional[dict]:
        """
        Generate a multimodal explanation card.

        Args:
            alert: The threat alert that triggered this explanation
            transcript_context: Recent transcript text (last ~200 words)
            screenshot_analysis: Vision analysis result if screen sharing active
            psych_scores: Current psychological manipulation scores
            lie_scores: Current lie detection scores
            language: User's language code

        Returns:
            dict with explanation_text, key_signals, risk_factors, recommended_action
        """
        if not self._model:
            return self._fallback_explanation(alert, screenshot_analysis)

        try:
            # Build context for Gemini
            context_parts = []

            context_parts.append(f"ALERT: {alert.get('pattern', 'Unknown')} (severity: {alert.get('severity', 'unknown')}, confidence: {alert.get('confidence', 0)}%)")

            if transcript_context:
                context_parts.append(f"RECENT TRANSCRIPT:\n{transcript_context[-500:]}")

            if screenshot_analysis and screenshot_analysis.get("threat_detected"):
                context_parts.append(f"SCREEN ANALYSIS: {screenshot_analysis.get('visual_threat_type', 'Unknown visual threat')} (confidence: {screenshot_analysis.get('confidence', 0)}%)")

            if psych_scores:
                active_tactics = [k for k, v in psych_scores.items() if v > 30]
                if active_tactics:
                    context_parts.append(f"ACTIVE MANIPULATION TACTICS: {', '.join(active_tactics)}")

            if lie_scores:
                active_lies = [k for k, v in lie_scores.items() if v > 30]
                if active_lies:
                    context_parts.append(f"DECEPTION INDICATORS: {', '.join(active_lies)}")

            lang_instruction = ""
            if language != "en":
                lang_instruction = f"\nRespond in the language with code: {language}. "

            prompt = f"""You are VoxGuard's explanation engine. Generate a clear, concise explanation card for a scam detection alert.

{chr(10).join(context_parts)}

{lang_instruction}
Respond ONLY with valid JSON (no markdown):
{{
  "headline": "One-line summary of the threat (max 15 words)",
  "explanation": "2-3 sentence explanation of WHY this is dangerous, combining audio and visual signals if both present. Write for a non-technical person who is currently scared.",
  "key_signals": [
    {{"signal": "what was detected", "source": "audio|visual|behavioral", "severity": "critical|high|medium"}},
  ],
  "risk_factors": ["factor 1", "factor 2"],
  "recommended_action": "One clear action the user should take right now",
  "confidence": 0-100
}}"""

            response = await self._model.generate_content_async(prompt)
            text = response.text.strip()
            if text.startswith("```"):
                text = text.split("\n", 1)[1].rsplit("```", 1)[0].strip()

            result = json.loads(text)

            # Validate required fields
            result.setdefault("headline", alert.get("pattern", "Threat Detected"))
            result.setdefault("explanation", "A scam pattern was detected in this call.")
            result.setdefault("key_signals", [])
            result.setdefault("risk_factors", [])
            result.setdefault("recommended_action", "End this call and verify through official channels.")
            result.setdefault("confidence", alert.get("confidence", 70))

            # Add metadata
            result["has_audio_signal"] = bool(transcript_context)
            result["has_visual_signal"] = bool(screenshot_analysis and screenshot_analysis.get("threat_detected"))
            result["alert_id"] = alert.get("id")
            result["pattern"] = alert.get("pattern")

            return result

        except Exception as e:
            logger.error(f"[ExplanationService] Error: {e}")
            return self._fallback_explanation(alert, screenshot_analysis)

    def _fallback_explanation(self, alert: dict, screenshot_analysis: Optional[dict] = None) -> dict:
        """Generate a basic explanation without Gemini."""
        pattern = alert.get("pattern", "Unknown Pattern")
        severity = alert.get("severity", "medium")
        confidence = alert.get("confidence", 70)

        has_visual = bool(screenshot_analysis and screenshot_analysis.get("threat_detected"))

        if has_visual:
            explanation = (
                f"VoxGuard detected '{pattern}' in the caller's speech "
                f"AND a visual threat on your screen: {screenshot_analysis.get('visual_threat_type', 'suspicious content')}. "
                f"The combination of audio and visual scam signals significantly increases the threat level."
            )
        else:
            explanation = (
                f"VoxGuard detected '{pattern}' based on the caller's speech patterns. "
                f"This matches known scam techniques with {confidence}% confidence."
            )

        signals = [{"signal": pattern, "source": "audio", "severity": severity}]
        if has_visual:
            signals.append({
                "signal": screenshot_analysis.get("visual_threat_type", "Visual threat"),
                "source": "visual",
                "severity": screenshot_analysis.get("severity", "medium"),
            })

        return {
            "headline": f"{severity.upper()}: {pattern}",
            "explanation": explanation,
            "key_signals": signals,
            "risk_factors": [alert.get("quote", "")] if alert.get("quote") else [],
            "recommended_action": "End this call and verify through official channels.",
            "confidence": confidence,
            "has_audio_signal": True,
            "has_visual_signal": has_visual,
            "alert_id": alert.get("id"),
            "pattern": pattern,
        }
