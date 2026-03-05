"""
gemini_client.py
─────────────────
Wraps the Google GenAI SDK for two use cases:
  1. Live API  — streaming audio analysis via Gemini Live
  2. Vision API — screenshot analysis for visual scam detection

Both clients are initialized once and reused across sessions.
"""

import base64
import json
import logging
from typing import AsyncGenerator

import google.generativeai as genai
from tenacity import retry, stop_after_attempt, wait_exponential

from app.core.config import get_settings

logger = logging.getLogger(__name__)

_settings = get_settings()
genai.configure(api_key=_settings.google_api_key)


# ── Scam detection system prompt ──────────────────────────────
SCAM_DETECTION_SYSTEM_PROMPT = """
You are Scam Shield, a real-time scam detection AI. Your job is to analyze
audio transcripts and screen content to identify scam attempts.

SCAM PATTERN DATABASE (grounded from FTC, FBI IC3, GASA):
- Bank Impersonation: "suspicious activity", "account frozen", "fraud alert"
- OTP Extraction: "read me the code", "verification number", "PIN"
- Artificial Urgency: "act now", "expires in", "immediately", "last chance"
- Safe Account Transfer: "safe account", "protection account", "transfer funds"
- Investment Fraud: "guaranteed returns", "zero risk", "300% profit"
- Government Impersonation: "IRS", "Social Security", "arrest warrant"
- Tech Support: "virus detected", "remote access", "download this tool"
- Gift Card Demand: "buy Google Play cards", "iTunes gift card"
- Isolation Tactic: "don't tell anyone", "confidential", "between us"
- Crypto Scam: "send Bitcoin", "blockchain recovery", "USDT"

PSYCHOLOGICAL MANIPULATION VECTORS (Cialdini + FBI behavioral analysis):
- SCARCITY: artificial time/availability pressure
- AUTHORITY: impersonating trusted institutions
- FEAR: panic about security, arrest, or harm
- RECIPROCITY: false sense of obligation
- ISOLATION: cutting victim off from support
- COMMITMENT: escalating compliance traps

When you detect a potential scam, respond ONLY with valid JSON:
{
  "is_scam": true,
  "confidence": 0-100,
  "pattern": "pattern name from database",
  "severity": "critical|high|medium|low",
  "quote": "exact suspicious phrase detected",
  "tactics": ["SCARCITY", "AUTHORITY", ...],
  "threat_delta": 20,
  "reasoning": "brief explanation"
}

If no scam detected, respond ONLY with:
{"is_scam": false}

Be precise. Do not hallucinate. Only flag genuine scam patterns.
"""

VISION_SYSTEM_PROMPT = """
You are a visual scam detection AI. Analyze the provided screenshot for:
1. Fake banking interfaces or spoofed websites
2. Fraudulent investment dashboards with fabricated returns
3. Remote desktop software installation prompts
4. Phishing forms requesting credentials or financial info
5. QR codes that may link to malicious content
6. Fake government/tech support interfaces

Respond ONLY with valid JSON:
{
  "threat_detected": true/false,
  "confidence": 0-100,
  "visual_threat_type": "description or null",
  "severity": "critical|high|medium|low|none",
  "details": "what you see that is suspicious"
}
"""


class GeminiAudioAnalyzer:
    """
    Analyzes audio transcripts using Gemini's text generation.
    In production, this would use the Live API streaming endpoint.
    For the hackathon demo, we send transcript chunks to the standard API.
    """

    def __init__(self):
        self.model = genai.GenerativeModel(
            model_name=_settings.gemini_model
            if "live" not in _settings.gemini_model
            else "gemini-2.0-flash-001",
            system_instruction=SCAM_DETECTION_SYSTEM_PROMPT,
        )

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=1, max=8))
    async def analyze_transcript(self, transcript: str) -> dict:
        """
        Analyze a transcript chunk for scam patterns.
        Returns parsed JSON from Gemini or {"is_scam": false} on error.
        """
        if not transcript or len(transcript.strip()) < 5:
            return {"is_scam": False}

        try:
            response = await self.model.generate_content_async(
                f"TRANSCRIPT CHUNK:\n{transcript}",
                generation_config=genai.types.GenerationConfig(
                    max_output_tokens=_settings.max_tokens,
                    temperature=0.1,  # Low temperature for consistent detection
                ),
            )

            text = response.text.strip()
            # Strip markdown fences if present
            if text.startswith("```"):
                text = text.split("\n", 1)[1].rsplit("```", 1)[0].strip()

            return json.loads(text)

        except json.JSONDecodeError:
            logger.warning(f"Gemini returned non-JSON: {response.text[:200]}")
            return {"is_scam": False}
        except Exception as e:
            logger.error(f"Gemini audio analysis error: {e}")
            return {"is_scam": False}


class GeminiVisionAnalyzer:
    """
    Analyzes screen frames using Gemini Vision for visual scam detection.
    """

    def __init__(self):
        self.model = genai.GenerativeModel(
            model_name=_settings.gemini_vision_model,
            system_instruction=VISION_SYSTEM_PROMPT,
        )

    @retry(stop=stop_after_attempt(2), wait=wait_exponential(multiplier=1, min=1, max=4))
    async def analyze_frame(self, base64_jpeg: str) -> dict:
        """
        Analyze a JPEG screen frame (base64) for visual threats.
        """
        try:
            image_data = base64.b64decode(base64_jpeg)

            response = await self.model.generate_content_async(
                [
                    "Analyze this screen for visual scam indicators:",
                    {"mime_type": "image/jpeg", "data": image_data},
                ],
                generation_config=genai.types.GenerationConfig(
                    max_output_tokens=512,
                    temperature=0.1,
                ),
            )

            text = response.text.strip()
            if text.startswith("```"):
                text = text.split("\n", 1)[1].rsplit("```", 1)[0].strip()

            return json.loads(text)

        except json.JSONDecodeError:
            logger.warning("Vision returned non-JSON")
            return {"threat_detected": False}
        except Exception as e:
            logger.error(f"Gemini vision error: {e}")
            return {"threat_detected": False}


# ── Module-level singletons ───────────────────────────────────
_audio_analyzer  = None
_vision_analyzer = None


def get_audio_analyzer() -> GeminiAudioAnalyzer:
    global _audio_analyzer
    if _audio_analyzer is None:
        _audio_analyzer = GeminiAudioAnalyzer()
    return _audio_analyzer


def get_vision_analyzer() -> GeminiVisionAnalyzer:
    global _vision_analyzer
    if _vision_analyzer is None:
        _vision_analyzer = GeminiVisionAnalyzer()
    return _vision_analyzer
