"""
app.services.audio_analyzer
----------------------------
v6: Fix Gemini audio decode — wrap PCM in WAV container (audio/wav),
filter bogus transcripts, and deduplicate repeated lines.
"""

import base64
import json
import logging
import struct
import time
import numpy as np

from app.core.config import get_settings

logger = logging.getLogger(__name__)
_settings = get_settings()

VAD_ENERGY_THRESHOLD = 0.0015
FLUSH_INTERVAL_SECONDS = 2.0
MIN_SPEECH_CHUNKS = 2

# Phrases Gemini returns when it can't decode audio — filter these out
_BOGUS_TRANSCRIPT_PHRASES = [
    "this is raw",
    "16khz",
    "16-bit",
    "pcm audio",
    "no audio content",
    "no speech",
    "audio content was provided",
    "cannot transcribe",
    "unable to transcribe",
    "no spoken",
    "inaudible",
    "[silence]",
    "[no speech]",
    # Filter prompt leakage — Gemini reading back our own prompt text
    "you are a real-time",
    "phone scam detection system",
    "analyzing a live call",
    "respond only with valid json",
    "now analyze the audio",
]


def _is_bogus_transcript(text: str) -> bool:
    lower = text.lower()
    return any(phrase in lower for phrase in _BOGUS_TRANSCRIPT_PHRASES)


def _pcm_to_wav(pcm_bytes: bytes, sample_rate: int = 16000,
                channels: int = 1, sampwidth: int = 2) -> bytes:
    """Wrap raw PCM bytes in a minimal WAV/RIFF container."""
    data_size = len(pcm_bytes)
    byte_rate = sample_rate * channels * sampwidth
    block_align = channels * sampwidth
    header = struct.pack(
        "<4sI4s4sIHHIIHH4sI",
        b"RIFF",
        36 + data_size,
        b"WAVE",
        b"fmt ",
        16,
        1,                 # AudioFormat PCM
        channels,
        sample_rate,
        byte_rate,
        block_align,
        sampwidth * 8,
        b"data",
        data_size,
    )
    return header + pcm_bytes


class AudioAnalyzerService:
    def __init__(self):
        self._audio_buffer = []
        self._speech_count = 0
        self._total_chunks = 0
        self._last_flush = time.time()
        self._transcript_history = ""
        self._last_transcript = ""
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
            # [FIX] Wrap raw PCM in WAV container before sending.
            # audio/L16 is not properly supported — Gemini describes the format
            # instead of transcribing. audio/wav with RIFF header works correctly.
            wav_bytes = _pcm_to_wav(combined, sample_rate=16000, channels=1, sampwidth=2)
            audio_b64 = base64.b64encode(wav_bytes).decode("utf-8")

            prompt = (
                "You are a real-time phone scam detection system analyzing a live call audio.\n\n"
                "This audio is captured from a device microphone during a phone call. "
                "It may contain TWO speakers: the CALLER (remote party, often sounds slightly different, "
                "may have phone/compression artifacts) and ME (the local user, clearer/closer to mic).\n\n"
                "1. TRANSCRIBE exactly what was said. If there is no clear speech, set transcript to empty string.\n"
                "2. IDENTIFY the speaker:\n"
                "   - 'caller' = the remote party calling in. They often sound like they're on phone, "
                "use formal/scripted language, claim authority, create urgency, ask for sensitive info.\n"
                "   - 'me' = the local user. Typically short responses: 'yes', 'ok', 'hello?', 'really?', "
                "'I don't understand', emotional reactions, clarifying questions.\n"
                "   - Use the previous conversation context to help determine speaker turns.\n"
                "   - If previous conversation is empty, default speaker to 'caller'.\n"
                "3. ANALYZE aggressively for scam indicators. Even mild suspicion should flag is_scam=true.\n"
                "4. List ALL manipulation TACTICS detected (UPPERCASE only): "
                "SCARCITY, AUTHORITY, FEAR, RECIPROCITY, ISOLATION, COMMITMENT\n"
                "5. List ALL deception LIE_INDICATORS detected (UPPERCASE only): "
                "INCONSISTENCY, VAGUENESS, OVERDETAIL, DEFLECTION, PRESSURE\n\n"
                "Common scam patterns: bank impersonation, OTP/credential extraction, "
                "urgency tactics, government impersonation, gift card demands, investment fraud, "
                "family impersonation, tech support scam, isolation tactics, wire transfer, "
                "crypto scam, loan app extortion, deepfake voice, job offer scam, digital arrest.\n\n"
                f"Previous conversation:\n{self._transcript_history[-600:]}\n\n"
                "Be aggressive in scam detection. If caller claims to be from a bank, government, "
                "or tech company and asks for personal info, that IS a scam.\n\n"
                "If the audio contains multiple turns, return only the LAST/MOST RECENT utterance.\n\n"
                "Respond ONLY with valid JSON, no markdown:\n"
                '{"transcript":"exact words spoken",'
                '"speaker":"caller or me",'
                '"is_scam":false,'
                '"severity":"low",'
                '"confidence":0,'
                '"pattern":"none",'
                '"quote":"most suspicious phrase",'
                '"tactics":[],'
                '"lie_indicators":[]}'
            )

            response = await self._model.generate_content_async([
                prompt,
                {"inline_data": {"mime_type": "audio/wav", "data": audio_b64}},
                "Now analyze the audio above and respond with JSON only.",
            ])

            text = response.text.strip()
            if text.startswith("```"):
                text = text.split("\n", 1)[1].rsplit("```", 1)[0].strip()

            result = json.loads(text)
            transcript = result.get("transcript", "").strip()

            # [FIX] Filter bogus transcripts where Gemini describes format instead of speech
            if transcript and _is_bogus_transcript(transcript):
                logger.warning("[AudioAnalyzer] Bogus transcript filtered: '%s'", transcript[:80])
                result["transcript"] = ""
                transcript = ""

            # [FIX] Deduplicate — suppress exact same transcript emitted twice in a row
            if transcript and transcript == self._last_transcript:
                logger.info("[AudioAnalyzer] Duplicate transcript suppressed: '%s'", transcript[:60])
                result["transcript"] = ""
                transcript = ""

            if transcript:
                self._last_transcript = transcript
                # Store with speaker label so Gemini has turn-taking context
                speaker_label = result.get("speaker", "caller").upper()
                self._transcript_history += f"\n[{speaker_label}]: {transcript}"
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
