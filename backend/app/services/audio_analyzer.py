"""
app.services.audio_analyzer
────────────────────────────
Receives base64 PCM audio chunks from the Rust WASM engine,
decodes and applies VAD, then sends transcripts to Gemini for analysis.
"""

import base64
import logging
import numpy as np

from app.core.gemini_client import get_audio_analyzer

logger = logging.getLogger(__name__)

VAD_ENERGY_THRESHOLD = 0.002
TRANSCRIPT_FLUSH_WORDS = 15


class AudioAnalyzerService:
    def __init__(self):
        self._transcript_buffer = ""
        self._word_count = 0
        self._gemini = get_audio_analyzer()

    async def process_chunk(self, base64_chunk: str) -> dict | None:
        try:
            pcm_bytes = base64.b64decode(base64_chunk)
            samples = np.frombuffer(pcm_bytes, dtype=np.int16).astype(np.float32) / 32768.0
            energy = float(np.sqrt(np.mean(samples ** 2)))
            if energy < VAD_ENERGY_THRESHOLD:
                return None
            if self._word_count >= TRANSCRIPT_FLUSH_WORDS:
                return await self._flush_to_gemini()
            return None
        except Exception as e:
            logger.error(f"Audio processing error: {e}")
            return None

    async def _flush_to_gemini(self) -> dict | None:
        transcript = self._transcript_buffer.strip()
        self._transcript_buffer = ""
        self._word_count = 0
        if not transcript:
            return None
        return await self._gemini.analyze_transcript(transcript)

    async def force_flush(self) -> dict | None:
        if self._transcript_buffer.strip():
            return await self._flush_to_gemini()
        return None
