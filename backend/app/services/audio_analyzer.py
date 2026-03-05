"""
audio_analyzer.py
─────────────────
Receives base64 PCM audio chunks from the Rust WASM engine,
converts them to text via a simple energy-based VAD + transcription
approach, then passes transcripts to Gemini for scam analysis.

In production, this would use Gemini's Live API streaming endpoint
directly for real-time audio → analysis in one step.
"""

import base64
import logging
import struct

import numpy as np

from app.core.gemini_client import get_audio_analyzer

logger = logging.getLogger(__name__)

# Minimum energy threshold to consider audio as speech (not silence)
VAD_ENERGY_THRESHOLD = 0.002

# Accumulate transcript words before sending to Gemini (reduce API calls)
TRANSCRIPT_FLUSH_WORDS = 15


class AudioAnalyzerService:
    """
    Per-session audio analysis pipeline:
    1. Receive base64 PCM chunk from Rust WASM
    2. Decode and check energy (VAD)
    3. Accumulate transcript buffer
    4. When buffer is rich enough, send to Gemini for scam analysis
    """

    def __init__(self):
        self._transcript_buffer = ""
        self._word_count        = 0
        self._gemini            = get_audio_analyzer()

    async def process_chunk(self, base64_chunk: str) -> dict | None:
        """
        Process one audio chunk.
        Returns Gemini analysis result if transcript was flushed, else None.
        """
        try:
            # Decode base64 → raw bytes → Int16 PCM → float32
            pcm_bytes = base64.b64decode(base64_chunk)
            samples   = np.frombuffer(pcm_bytes, dtype=np.int16).astype(np.float32) / 32768.0

            # VAD: skip silence
            energy = float(np.sqrt(np.mean(samples ** 2)))
            if energy < VAD_ENERGY_THRESHOLD:
                return None

            # Simulate transcript from audio energy patterns
            # In production: use Gemini Live API streaming for real ASR
            simulated_words = self._simulate_transcript(samples, energy)
            if simulated_words:
                self._transcript_buffer += " " + simulated_words
                self._word_count        += len(simulated_words.split())

            # Flush to Gemini when we have enough context
            if self._word_count >= TRANSCRIPT_FLUSH_WORDS:
                result = await self._flush_to_gemini()
                return result

            return None

        except Exception as e:
            logger.error(f"Audio processing error: {e}")
            return None

    async def _flush_to_gemini(self) -> dict | None:
        """Send accumulated transcript to Gemini and reset buffer."""
        transcript = self._transcript_buffer.strip()
        self._transcript_buffer = ""
        self._word_count        = 0

        if not transcript:
            return None

        logger.debug(f"Sending transcript to Gemini: {transcript[:80]}...")
        return await self._gemini.analyze_transcript(transcript)

    def _simulate_transcript(self, samples: np.ndarray, energy: float) -> str:
        """
        Placeholder for real ASR.

        In the full production system, audio chunks are streamed directly
        to Gemini Live API which handles ASR + analysis in one step.

        For the demo/test environment where Live API streaming isn't
        available, we return an empty string and rely on the frontend
        demo mode for simulation.
        """
        return ""

    async def force_flush(self) -> dict | None:
        """Flush remaining buffer at session end."""
        if self._transcript_buffer.strip():
            return await self._flush_to_gemini()
        return None
