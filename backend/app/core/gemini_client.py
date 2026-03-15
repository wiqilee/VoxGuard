"""
app.core.gemini_client
──────────────────────
Thin wrappers around the google-generativeai SDK.
"""

import logging
import json
from app.core.config import get_settings

logger = logging.getLogger(__name__)

_settings = get_settings()


class AudioAnalyzerClient:
    """Sends transcript text to Gemini for scam analysis."""

    def __init__(self):
        self._model = None
        self._init_model()

    def _init_model(self):
        if not _settings.google_api_key:
            logger.warning("[GeminiClient] No GOOGLE_API_KEY set, analysis disabled")
            return
        try:
            import google.generativeai as genai
            genai.configure(api_key=_settings.google_api_key)
            self._model = genai.GenerativeModel(_settings.gemini_vision_model)
            logger.info("[GeminiClient] Audio analyzer model ready")
        except Exception as e:
            logger.error(f"[GeminiClient] Init failed: {e}")

    async def analyze_transcript(self, transcript: str) -> dict:
        if not self._model:
            return {"is_scam": False}
        try:
            prompt = f"""Analyze this phone call transcript for scam indicators.
Respond ONLY with valid JSON (no markdown):
{{"is_scam": bool, "severity": "critical|high|medium|low", "confidence": 0-100,
  "pattern": "pattern name", "quote": "most suspicious quote",
  "tactics": ["SCARCITY","AUTHORITY","FEAR","RECIPROCITY","ISOLATION","COMMITMENT"]}}

Transcript: {transcript}"""
            response = await self._model.generate_content_async(prompt)
            text = response.text.strip()
            if text.startswith("```"):
                text = text.split("\n", 1)[1].rsplit("```", 1)[0].strip()
            return json.loads(text)
        except Exception as e:
            logger.error(f"[GeminiClient] Analysis error: {e}")
            return {"is_scam": False}


class VisionAnalyzerClient:
    """Sends screenshots to Gemini Vision for visual scam detection."""

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
            logger.info("[GeminiClient] Vision analyzer model ready")
        except Exception as e:
            logger.error(f"[GeminiClient] Vision init failed: {e}")

    async def analyze_frame(self, base64_jpeg: str) -> dict:
        if not self._model:
            return {"threat_detected": False}
        try:
            image_part = {"mime_type": "image/jpeg", "data": base64_jpeg}
            prompt = """Analyze this screenshot for visual scam indicators:
fake bank login, phishing form, malicious QR code, spoofed government site,
fraudulent investment dashboard, remote access tool install prompt.
Respond ONLY with JSON: {"threat_detected": bool, "severity": "critical|high|medium|low",
"visual_threat_type": "description", "confidence": 0-100}"""
            response = await self._model.generate_content_async([prompt, image_part])
            text = response.text.strip()
            if text.startswith("```"):
                text = text.split("\n", 1)[1].rsplit("```", 1)[0].strip()
            return json.loads(text)
        except Exception as e:
            logger.error(f"[GeminiClient] Vision error: {e}")
            return {"threat_detected": False}


def get_audio_analyzer() -> AudioAnalyzerClient:
    return AudioAnalyzerClient()


def get_vision_analyzer() -> VisionAnalyzerClient:
    return VisionAnalyzerClient()
