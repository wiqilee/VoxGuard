"""
app.services.audio_analyzer
----------------------------
v5: 2-second flush for paid tier, lower VAD threshold,
requests tactics + lie_indicators from Gemini.
"""

import base64
import json
import logging
import time
import numpy as np

from app.core.config import get_settings

logger = logging.getLogger(__name__)
_settings = get_settings()

VAD_ENERGY_THRESHOLD = 0.0015
FLUSH_INTERVAL_SECONDS = 2.0
MIN_SPEECH_CHUNKS = 2


class AudioAnalyzerService:
    def __init__(self):
        self._audio_buffer = []
        self._speech_count = 0
        self._total_chunks = 0
        self._last_flush = time.time()
        self._transcript_history = ""
        self._model = None
        self._retry_after = 0
        self._init_model()

    def _init_model(self):
        if not _settings.google_api_key:
            logger.warning("[AudioAnalyzer] No API key, disabled")
            return
        try:
            import google.generativeai as genai
            genai.configure(api_key=_settings.google_api_key)
            self._model = genai.GenerativeModel(_settings.gemini_model)
            logger.info("[AudioAnalyzer] Model ready: %s", _settings.gemini_model)
        except Exception as e:
            logger.error("[AudioAnalyzer] Init failed: %s", e)

    async def process_chunk(self, base64_chunk: str) -> dict | None:
        try:
            self._total_chunks += 1
            pcm_bytes = base64.b64decode(base64_chunk)
            samples = np.frombuffer(pcm_bytes, dtype=np.int16).astype(np.float32) / 32768.0
            energy = float(np.sqrt(np.mean(samples ** 2)))

            if energy < VAD_ENERGY_THRESHOLD:
                elapsed = time.time() - self._last_flush
                if self._speech_count >= MIN_SPEECH_CHUNKS and elapsed > 1.5:
                    return await self._flush()
                return None

            self._audio_buffer.append(pcm_bytes)
            self._speech_count += 1

            if self._total_chunks <= 3 or self._total_chunks % 80 == 0:
                logger.info("[AudioAnalyzer] Chunk #%d energy=%.4f buffered=%d",
                    self._total_chunks, energy, self._speech_count)

            elapsed = time.time() - self._last_flush
            if elapsed >= FLUSH_INTERVAL_SECONDS and self._speech_count >= MIN_SPEECH_CHUNKS:
                return await self._flush()

            return None
        except Exception as e:
            logger.error("[AudioAnalyzer] process_chunk error: %s", e)
            return None

    async def _flush(self) -> dict | None:
        if self._speech_count < MIN_SPEECH_CHUNKS:
            self._audio_buffer = []
            self._speech_count = 0
            self._last_flush = time.time()
            return None

        if time.time() < self._retry_after:
            logger.info("[AudioAnalyzer] Rate limited, keeping buffer.")
            return None

        combined = b"".join(self._audio_buffer)
        count = self._speech_count
        self._audio_buffer = []
        self._speech_count = 0
        self._last_flush = time.time()

        if not combined or not self._model:
            return None

        logger.info("[AudioAnalyzer] Flushing %d chunks (%d bytes) to Gemini", count, len(combined))

        try:
            audio_b64 = base64.b64encode(combined).decode("utf-8")

            prompt = (
                "You are a real-time phone scam detection system analyzing a live call. "
                "This is raw 16kHz 16-bit mono PCM audio.\n\n"
                "1. TRANSCRIBE exactly what was said.\n"
                "2. ANALYZE aggressively for scam indicators. Even mild suspicion should flag is_scam=true with appropriate severity.\n"
                "3. List ALL manipulation TACTICS detected (UPPERCASE only): "
                "SCARCITY, AUTHORITY, FEAR, RECIPROCITY, ISOLATION, COMMITMENT\n"
                "4. List ALL deception LIE_INDICATORS detected (UPPERCASE only): "
                "INCONSISTENCY, VAGUENESS, OVERDETAIL, DEFLECTION, PRESSURE\n\n"
                "Common scam patterns to watch for: bank impersonation, OTP/credential extraction, "
                "urgency tactics, government impersonation, gift card demands, investment fraud, "
                "family impersonation, tech support scam, isolation tactics, wire transfer, "
                "crypto scam, loan app extortion, deepfake voice, job offer scam, digital arrest.\n\n"
                f"Previous conversation: {self._transcript_history[-500:]}\n\n"
                "Be aggressive in detection. If someone claims to be from a bank, government, "
                "or tech company and asks for personal info, that IS a scam.\n\n"
                "Respond ONLY with valid JSON, no markdown:\n"
                '{"transcript":"exact words spoken",'
                '"speaker":"caller",'
                '"is_scam":false,'
                '"severity":"low",'
                '"confidence":0,'
                '"pattern":"none",'
                '"quote":"most suspicious phrase",'
                '"tactics":[],'
                '"lie_indicators":[]}'
            )

            response = await self._model.generate_content_async([
                {"inline_data": {"mime_type": "audio/L16;rate=16000;channels=1", "data": audio_b64}},
                prompt,
            ])

            text = response.text.strip()
            if text.startswith("```"):
                text = text.split("\n", 1)[1].rsplit("```", 1)[0].strip()

            result = json.loads(text)

            transcript = result.get("transcript", "")
            if transcript:
                self._transcript_history += " " + transcript
                if len(self._transcript_history) > 1500:
                    self._transcript_history = self._transcript_history[-1500:]

            logger.info(
                "[AudioAnalyzer] Result: transcript='%s' is_scam=%s severity=%s pattern=%s tactics=%s",
                transcript[:60], result.get("is_scam"), result.get("severity"),
                result.get("pattern"), result.get("tactics")
            )
            return result

        except Exception as e:
            error_str = str(e)
            if "429" in error_str:
                self._retry_after = time.time() + 20
                logger.warning("[AudioAnalyzer] Rate limited. Backing off 20s.")
            else:
                logger.error("[AudioAnalyzer] Gemini error: %s", e)
            return None

    async def force_flush(self) -> dict | None:
        if self._audio_buffer and self._speech_count >= 1:
            return await self._flush()
        return None
