"""
app.services.psych_analyzer
────────────────────────────
Scores the 6 Cialdini psychological manipulation vectors AND 5 FBI CBCA
lie detection indicators from transcript text using Gemini's reasoning.

Psych Vectors: SCARCITY, AUTHORITY, FEAR, RECIPROCITY, ISOLATION, COMMITMENT
Lie Indicators: INCONSISTENCY, VAGUENESS, OVERDETAIL, DEFLECTION, PRESSURE

Also returns an intervention_recommendation when manipulation intensity
crosses dangerous thresholds, feeding the Live Scam Intervention system.
"""

import json
import logging
from app.core.config import get_settings

logger = logging.getLogger(__name__)
_settings = get_settings()


class PsychAnalyzerService:
    """Analyzes transcripts for psychological manipulation and deception patterns."""

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
            logger.info("[PsychAnalyzer] Model ready")
        except Exception as e:
            logger.error(f"[PsychAnalyzer] Init failed: {e}")

    async def analyze(self, transcript: str) -> dict:
        """
        Returns dict with:
          psych_scores: {"SCARCITY": 0-100, ...}
          lie_scores: {"INCONSISTENCY": 0-100, ...}
          intervention_recommendation: "WARN" | "BLOCK" | "LOCKDOWN" | null
        """
        if not self._model or not transcript.strip():
            return {}

        try:
            prompt = f"""Analyze this phone call transcript for TWO things:

1. PSYCHOLOGICAL MANIPULATION (Cialdini's 6 principles):
Score each from 0 to 100 based on how strongly they appear.

2. LIE DETECTION (FBI CBCA behavioral indicators):
Score each from 0 to 100 based on deception signals.

3. INTERVENTION RECOMMENDATION:
Based on combined manipulation + deception intensity, recommend:
- null if low risk
- "WARN" if moderate manipulation detected
- "BLOCK" if caller is actively extracting credentials or money
- "LOCKDOWN" if victim is in immediate danger of financial loss

Respond ONLY with valid JSON, no markdown:
{{
  "psych_scores": {{"SCARCITY": 0, "AUTHORITY": 0, "FEAR": 0, "RECIPROCITY": 0, "ISOLATION": 0, "COMMITMENT": 0}},
  "lie_scores": {{"INCONSISTENCY": 0, "VAGUENESS": 0, "OVERDETAIL": 0, "DEFLECTION": 0, "PRESSURE": 0}},
  "intervention_recommendation": null
}}

Transcript: {transcript}"""

            response = await self._model.generate_content_async(prompt)
            text = response.text.strip()
            if text.startswith("```"):
                text = text.split("\n", 1)[1].rsplit("```", 1)[0].strip()
            result = json.loads(text)

            # Validate structure
            if "psych_scores" not in result:
                result["psych_scores"] = {}
            if "lie_scores" not in result:
                result["lie_scores"] = {}
            if "intervention_recommendation" not in result:
                result["intervention_recommendation"] = None

            return result
        except Exception as e:
            logger.error(f"[PsychAnalyzer] Error: {e}")
            return {}