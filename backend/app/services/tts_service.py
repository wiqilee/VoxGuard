"""
app.services.tts_service
─────────────────────────
Natural voice generation for Live Scam Intervention using Gemini TTS.

Generates contextual spoken warnings that match the detected scam type,
severity, and user's language. Uses gemini-2.5-flash-preview-tts for
human-quality speech output.

Voice Profiles:
  WARN     → Calm, advisory tone (Kore)
  BLOCK    → Firm, urgent tone (Puck)
  LOCKDOWN → Sharp, commanding tone (Charon)

Output: base64-encoded WAV audio sent to frontend via WebSocket.
"""

import asyncio
import base64
import logging
from typing import Optional

from app.core.config import get_settings

logger = logging.getLogger(__name__)
_settings = get_settings()

# ── Intervention voice scripts per language ──────────────────

INTERVENTION_SCRIPTS = {
    "en": {
        "WARN": {
            "generic": "Caution. VoxGuard has detected suspicious patterns in this call. The caller may not be who they claim to be. Do not share any personal information yet.",
            "bank": "Warning. This caller claims to be from your bank, but legitimate banks never ask for your PIN or OTP over the phone. Do not share any codes.",
            "government": "Warning. Government agencies do not call to threaten arrest or demand immediate payment. This is a common scam tactic.",
            "tech_support": "Caution. No legitimate company will cold-call you about a virus on your computer. Do not install any software they suggest.",
            "investment": "Caution. There is no such thing as guaranteed returns with zero risk. This matches known investment fraud patterns.",
        },
        "BLOCK": {
            "generic": "Stop. VoxGuard has detected a high-confidence scam. The caller is attempting to extract sensitive information or money from you. End this call now.",
            "otp": "Stop immediately. The caller is asking for your one-time password. A real bank or company will never ask for this. Hang up now.",
            "transfer": "Stop. You are being asked to transfer money to a so-called safe account. This is a well-known fraud technique. No legitimate institution does this.",
            "gift_card": "Stop. No legitimate organization accepts payment through gift cards. This is a confirmed scam pattern. Hang up immediately.",
            "crypto": "Stop. You are being asked to send cryptocurrency. These transfers are irreversible. This is a scam. End this call now.",
            "remote_access": "Stop. The caller is asking for remote access to your device. This will give them full control of your computer and bank accounts. Hang up now.",
        },
        "LOCKDOWN": {
            "generic": "Emergency. VoxGuard has confirmed this is a scam with maximum confidence. This call will disconnect automatically in 30 seconds. Do not provide any information. Hang up now.",
        },
    },
    "id": {
        "WARN": {
            "generic": "Perhatian. VoxGuard mendeteksi pola mencurigakan dalam panggilan ini. Penelepon mungkin bukan siapa yang mereka klaim. Jangan bagikan informasi pribadi.",
            "bank": "Peringatan. Penelepon mengaku dari bank Anda, tetapi bank resmi tidak pernah meminta PIN atau OTP melalui telepon.",
            "government": "Peringatan. Instansi pemerintah tidak menelepon untuk mengancam penangkapan atau meminta pembayaran segera.",
        },
        "BLOCK": {
            "generic": "Berhenti. VoxGuard mendeteksi penipuan tingkat tinggi. Penelepon mencoba mengambil informasi sensitif atau uang Anda. Akhiri panggilan ini sekarang.",
            "otp": "Berhenti sekarang. Penelepon meminta kode OTP Anda. Bank atau perusahaan asli tidak pernah meminta ini. Tutup telepon sekarang.",
            "transfer": "Berhenti. Anda diminta mentransfer uang ke rekening aman. Ini adalah teknik penipuan. Tidak ada institusi resmi yang melakukan ini.",
        },
        "LOCKDOWN": {
            "generic": "Darurat. VoxGuard mengonfirmasi ini adalah penipuan. Panggilan akan terputus otomatis dalam 30 detik. Jangan berikan informasi apapun. Tutup telepon sekarang.",
        },
    },
    "zh": {
        "WARN": {
            "generic": "注意。VoxGuard检测到此通话中的可疑模式。来电者可能不是他们声称的人。请不要分享任何个人信息。",
        },
        "BLOCK": {
            "generic": "停止。VoxGuard检测到高可信度诈骗。来电者正试图获取您的敏感信息或资金。立即结束此通话。",
            "otp": "立即停止。来电者正在索要您的一次性密码。真正的银行或公司永远不会要求这些。立即挂断电话。",
        },
        "LOCKDOWN": {
            "generic": "紧急情况。VoxGuard已确认这是诈骗。通话将在30秒后自动断开。请勿提供任何信息。立即挂断。",
        },
    },
    "ja": {
        "WARN": {
            "generic": "注意。VoxGuardがこの通話で不審なパターンを検出しました。相手は本人ではない可能性があります。個人情報を共有しないでください。",
        },
        "BLOCK": {
            "generic": "停止してください。VoxGuardが高確率で詐欺を検出しました。相手はあなたの機密情報やお金を騙し取ろうとしています。今すぐ通話を終了してください。",
        },
        "LOCKDOWN": {
            "generic": "緊急事態。VoxGuardがこれを詐欺と確認しました。30秒後に自動切断されます。情報を提供しないでください。今すぐ電話を切ってください。",
        },
    },
    "ko": {
        "WARN": {
            "generic": "주의. VoxGuard가 이 통화에서 의심스러운 패턴을 감지했습니다. 상대방이 자신이 주장하는 사람이 아닐 수 있습니다. 개인정보를 공유하지 마세요.",
        },
        "BLOCK": {
            "generic": "중지. VoxGuard가 높은 확률로 사기를 감지했습니다. 상대방이 민감한 정보나 돈을 빼내려 하고 있습니다. 지금 즉시 전화를 끊으세요.",
        },
        "LOCKDOWN": {
            "generic": "긴급. VoxGuard가 이 전화를 사기로 확인했습니다. 30초 후 자동으로 연결이 끊어집니다. 어떤 정보도 제공하지 마세요.",
        },
    },
    "es": {
        "WARN": {"generic": "Precaución. VoxGuard ha detectado patrones sospechosos en esta llamada. No comparta información personal."},
        "BLOCK": {"generic": "Deténgase. VoxGuard ha detectado una estafa de alta confianza. Cuelgue ahora."},
        "LOCKDOWN": {"generic": "Emergencia. VoxGuard ha confirmado que esto es una estafa. La llamada se desconectará automáticamente en 30 segundos."},
    },
    "fr": {
        "WARN": {"generic": "Attention. VoxGuard a détecté des schémas suspects dans cet appel. Ne partagez aucune information personnelle."},
        "BLOCK": {"generic": "Arrêtez. VoxGuard a détecté une arnaque à haute confiance. Raccrochez maintenant."},
        "LOCKDOWN": {"generic": "Urgence. VoxGuard a confirmé qu'il s'agit d'une arnaque. L'appel sera déconnecté automatiquement dans 30 secondes."},
    },
    "hi": {
        "WARN": {"generic": "सावधान। VoxGuard ने इस कॉल में संदिग्ध पैटर्न का पता लगाया है। कोई भी व्यक्तिगत जानकारी साझा न करें।"},
        "BLOCK": {"generic": "रुकिए। VoxGuard ने उच्च विश्वास के साथ धोखाधड़ी का पता लगाया है। अभी फोन काट दें।"},
        "LOCKDOWN": {"generic": "आपातकाल। VoxGuard ने पुष्टि की है कि यह धोखाधड़ी है। 30 सेकंड में कॉल स्वतः डिस्कनेक्ट हो जाएगी।"},
    },
    "ar": {
        "WARN": {"generic": "تحذير. اكتشف VoxGuard أنماطًا مشبوهة في هذه المكالمة. لا تشارك أي معلومات شخصية."},
        "BLOCK": {"generic": "توقف. اكتشف VoxGuard عملية احتيال بثقة عالية. أغلق الهاتف الآن."},
        "LOCKDOWN": {"generic": "طوارئ. أكد VoxGuard أن هذه عملية احتيال. سيتم قطع المكالمة تلقائيًا خلال 30 ثانية."},
    },
}

# Map scam patterns to script keys
PATTERN_TO_SCRIPT_KEY = {
    "Bank Impersonation": "bank",
    "OTP / Credential Extraction": "otp",
    "Safe Account Transfer": "transfer",
    "Gift Card Demand": "gift_card",
    "Crypto Transfer Scam": "crypto",
    "Government Impersonation": "government",
    "Tech Support Impersonation": "tech_support",
    "Investment Fraud": "investment",
    "Remote Access Takeover": "remote_access",
    # Indonesian
    "Pencurian OTP / Kredensial": "otp",
    # Fallback for all others
}


class TTSService:
    """Generates natural spoken intervention audio via Gemini TTS."""

    def __init__(self):
        self._client = None
        self._model_name = _settings.gemini_tts_model
        self._init_client()

    def _init_client(self):
        if not _settings.google_api_key:
            logger.warning("[TTSService] No GOOGLE_API_KEY, TTS disabled")
            return
        try:
            from google import genai

            self._client = genai.Client(api_key=_settings.google_api_key)
            logger.info(f"[TTSService] Client ready, model: {self._model_name}")
        except ImportError:
            # Fallback to legacy SDK
            try:
                import google.generativeai as genai

                genai.configure(api_key=_settings.google_api_key)
                self._client = genai
                self._legacy_sdk = True
                logger.info(f"[TTSService] Legacy SDK ready: {self._model_name}")
            except Exception as e:
                logger.warning(f"[TTSService] SDK init failed: {e}, REST API fallback available")
                # REST API will still work via _generate_rest_api — just need the API key
                self._rest_only = True
        except Exception as e:
            logger.warning(f"[TTSService] Init failed: {e}, REST API fallback available")
            self._rest_only = True

    @property
    def _legacy_sdk(self):
        return getattr(self, '_is_legacy_sdk', False)

    @_legacy_sdk.setter
    def _legacy_sdk(self, value):
        self._is_legacy_sdk = value

    def _get_script(self, level: str, pattern: str, language: str) -> str:
        """Get the best matching intervention script."""
        lang = language[:2].lower() if language else "en"
        if lang not in INTERVENTION_SCRIPTS:
            lang = "en"

        level_scripts = INTERVENTION_SCRIPTS[lang].get(level, {})
        script_key = PATTERN_TO_SCRIPT_KEY.get(pattern, "generic")

        # Try specific pattern script, fall back to generic
        text = level_scripts.get(script_key) or level_scripts.get("generic", "")

        if not text:
            # Ultimate fallback to English
            text = INTERVENTION_SCRIPTS["en"].get(level, {}).get(script_key, "")
            if not text:
                text = INTERVENTION_SCRIPTS["en"].get(level, {}).get("generic", "Warning. Possible scam detected.")

        return text

    async def generate_intervention_audio(
        self,
        level: str,
        pattern: str,
        language: str = "en",
        custom_text: Optional[str] = None,
    ) -> Optional[dict]:
        """
        Generate spoken intervention audio.

        Returns:
            dict with "audio_base64" (WAV) and "script_text", or None on failure.
        """
        script = custom_text or self._get_script(level, pattern, language)

        if not script:
            return None

        # If no client available, try REST API directly (bypasses SDK entirely)
        if not self._client:
            if _settings.google_api_key and getattr(self, '_rest_only', False):
                logger.info("[TTSService] No SDK client, using REST API directly")
                try:
                    voice = {"WARN": "Kore", "BLOCK": "Puck", "LOCKDOWN": "Charon"}.get(level, "Kore")
                    audio_data = await self._generate_rest_api(script, voice)
                    if audio_data:
                        audio_b64 = base64.b64encode(audio_data).decode("utf-8")
                        return {
                            "audio_base64": audio_b64,
                            "audio_mime": "audio/wav",
                            "script_text": script,
                            "voice": voice,
                            "fallback": None,
                        }
                except Exception as e:
                    logger.error(f"[TTSService] REST API fallback failed: {e}")

            logger.warning("[TTSService] No client, returning text-only fallback")
            return {
                "audio_base64": None,
                "script_text": script,
                "fallback": "browser_tts",
            }

        try:
            # Voice style based on intervention level
            voice_config = {
                "WARN": "Kore",      # Calm, measured
                "BLOCK": "Puck",     # Firm, authoritative
                "LOCKDOWN": "Charon", # Commanding, urgent
            }

            voice = voice_config.get(level, "Kore")

            audio_data = await self._generate_with_client(script, voice)

            if audio_data:
                audio_b64 = base64.b64encode(audio_data).decode("utf-8")
                logger.info(f"[TTSService] Generated audio for {level}/{pattern} ({len(audio_data)} bytes)")
                return {
                    "audio_base64": audio_b64,
                    "audio_mime": "audio/wav",
                    "script_text": script,
                    "voice": voice,
                    "fallback": None,
                }
            else:
                logger.warning("[TTSService] No audio in response, falling back to text")
                return {
                    "audio_base64": None,
                    "script_text": script,
                    "fallback": "browser_tts",
                }

        except Exception as e:
            logger.error(f"[TTSService] Generation error: {e}", exc_info=True)
            return {
                "audio_base64": None,
                "script_text": script,
                "fallback": "browser_tts",
            }

    async def _generate_with_client(self, script: str, voice: str) -> Optional[bytes]:
        """Generate audio using the appropriate SDK version, with REST API fallback."""
        # Try SDK first
        try:
            if self._legacy_sdk:
                result = await self._generate_legacy(script, voice)
            else:
                result = await self._generate_modern(script, voice)
            if result:
                return result
            logger.warning("[TTSService] SDK returned no audio, trying REST API fallback")
        except Exception as e:
            logger.warning(f"[TTSService] SDK generation failed ({e}), trying REST API fallback")

        # REST API fallback — works regardless of SDK version
        return await self._generate_rest_api(script, voice)

    async def _generate_modern(self, script: str, voice: str) -> Optional[bytes]:
        """Generate audio using google-genai (modern SDK)."""
        from google.genai import types

        response = await asyncio.to_thread(
            self._client.models.generate_content,
            model=self._model_name,
            contents=script,
            config=types.GenerateContentConfig(
                response_modalities=["AUDIO"],
                speech_config=types.SpeechConfig(
                    voice_config=types.VoiceConfig(
                        prebuilt_voice_config=types.PrebuiltVoiceConfig(
                            voice_name=voice,
                        )
                    )
                ),
            ),
        )

        # Extract audio from response
        if response.candidates:
            for part in response.candidates[0].content.parts:
                if part.inline_data and part.inline_data.data:
                    logger.info(f"[TTSService] Got audio: {part.inline_data.mime_type}, {len(part.inline_data.data)} bytes")
                    return part.inline_data.data

        return None

    async def _generate_legacy(self, script: str, voice: str) -> Optional[bytes]:
        """Generate audio using google-generativeai (legacy SDK)."""
        model = self._client.GenerativeModel(self._model_name)

        # Run sync call in thread to not block event loop
        response = await asyncio.to_thread(
            model.generate_content,
            script,
            generation_config={
                "response_modalities": ["AUDIO"],
                "speech_config": {
                    "voice_config": {
                        "prebuilt_voice_config": {
                            "voice_name": voice,
                        }
                    }
                },
            },
        )

        # Extract audio from response
        if response.candidates:
            for part in response.candidates[0].content.parts:
                if hasattr(part, "inline_data") and part.inline_data:
                    if hasattr(part.inline_data, "data") and part.inline_data.data:
                        return part.inline_data.data

        return None

    async def _generate_rest_api(self, script: str, voice: str) -> Optional[bytes]:
        """
        Generate audio via Gemini REST API directly.
        Bypasses SDK entirely — works with any SDK version.
        Uses httpx (already in requirements.txt).
        """
        import httpx

        api_key = _settings.google_api_key
        if not api_key:
            logger.error("[TTSService REST] No API key available")
            return None

        url = (
            f"https://generativelanguage.googleapis.com/v1beta/models/"
            f"{self._model_name}:generateContent?key={api_key}"
        )

        payload = {
            "contents": [{"parts": [{"text": script}]}],
            "generationConfig": {
                "response_modalities": ["AUDIO"],
                "speech_config": {
                    "voice_config": {
                        "prebuilt_voice_config": {
                            "voice_name": voice,
                        }
                    }
                },
            },
        }

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.post(
                    url,
                    json=payload,
                    headers={"Content-Type": "application/json"},
                )

                if resp.status_code != 200:
                    logger.error(f"[TTSService REST] API {resp.status_code}: {resp.text[:200]}")
                    return None

                data = resp.json()
                candidates = data.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    for part in parts:
                        inline = part.get("inlineData", {})
                        if inline.get("data"):
                            audio_bytes = base64.b64decode(inline["data"])
                            logger.info(
                                f"[TTSService REST] Got audio: "
                                f"{inline.get('mimeType','?')}, {len(audio_bytes)} bytes"
                            )
                            return audio_bytes

                logger.warning("[TTSService REST] No audio data in response")
                return None

        except Exception as e:
            logger.error(f"[TTSService REST] Error: {e}", exc_info=True)
            return None

    async def generate_explanation_audio(
        self,
        explanation_text: str,
        language: str = "en",
    ) -> Optional[dict]:
        """Generate spoken explanation for multimodal explanation cards."""
        return await self.generate_intervention_audio(
            level="WARN",
            pattern="generic",
            language=language,
            custom_text=explanation_text,
        )
