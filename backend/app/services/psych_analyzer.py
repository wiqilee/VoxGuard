"""
app.services.psych_analyzer
────────────────────────────
Scores the 6 Cialdini psychological manipulation vectors
from transcript text using Gemini's reasoning capabilities.

Vectors: SCARCITY, AUTHORITY, FEAR, RECIPROCITY, ISOLATION, COMMITMENT
"""

import json
import logging
from app.core.config import get_settings

logger = logging.getLogger(__name__)
_settings = get_settings()


class PsychAnalyzerService:
    """Analyzes transcripts for psychological manipulation patterns."""

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
        Returns dict of vector scores: {"SCARCITY": 0-100, "AUTHORITY": 0-100, ...}
        """
        if not self._model or not transcript.strip():
            return {}

        try:
            prompt = f"""Analyze this phone call transcript for psychological manipulation tactics.
Score each of Cialdini's 6 influence principles from 0 to 100 based on how strongly
they appear in the text. Respond ONLY with valid JSON, no markdown:
{{"SCARCITY": 0, "AUTHORITY": 0, "FEAR": 0, "RECIPROCITY": 0, "ISOLATION": 0, "COMMITMENT": 0}}

Transcript: {transcript}"""

            response = await self._model.generate_content_async(prompt)
            text = response.text.strip()
            if text.startswith("```"):
                text = text.split("\n", 1)[1].rsplit("```", 1)[0].strip()
            return json.loads(text)
        except Exception as e:
            logger.error(f"[PsychAnalyzer] Error: {e}")
            return {}
