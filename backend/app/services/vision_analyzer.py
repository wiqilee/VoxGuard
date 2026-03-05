"""
app.services.vision_analyzer
─────────────────────────────
Receives base64 JPEG frames from screen capture,
sends them to Gemini Vision for visual scam detection.

Detects: fake bank UIs, phishing forms, malicious QR codes,
spoofed government portals, remote access tool prompts.
"""

import logging
from app.core.gemini_client import get_vision_analyzer

logger = logging.getLogger(__name__)

FRAME_COOLDOWN_SECONDS = 2


class VisionAnalyzerService:
    def __init__(self):
        self._gemini = get_vision_analyzer()
        self._frame_count = 0

    async def process_frame(self, base64_jpeg: str) -> dict | None:
        if not base64_jpeg:
            return None
        self._frame_count += 1
        try:
            result = await self._gemini.analyze_frame(base64_jpeg)
            if result and result.get("threat_detected"):
                logger.warning(
                    f"[Vision] Threat detected: {result.get('visual_threat_type')} "
                    f"(confidence: {result.get('confidence')}%)"
                )
            return result
        except Exception as e:
            logger.error(f"Vision processing error: {e}")
            return None

    @property
    def frame_count(self) -> int:
        return self._frame_count
