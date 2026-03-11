"""
app.services.action_agent
──────────────────────────
Guided Anti-Scam Action Agent.

After Safe Exit, generates a personalized step-by-step action plan
based on scam type, country, severity, and what information may have
been compromised. Goes beyond "call your bank" — provides specific
numbers, websites, and next steps.

Supports 9 countries with full localized action plans.
"""

import json
import logging
from typing import Optional

from app.core.config import get_settings

logger = logging.getLogger(__name__)
_settings = get_settings()

# ── Emergency contacts & reporting channels per country ─────

COUNTRY_RESOURCES = {
    "US": {
        "name": "United States",
        "flag": "🇺🇸",
        "emergency": "911",
        "actions": {
            "block_number": "Block the caller's number in your phone settings",
            "report_ftc": "Report to FTC at reportfraud.ftc.gov or call 1-877-382-4357",
            "report_fbi": "File a complaint with FBI IC3 at ic3.gov",
            "credit_freeze": "Place a fraud alert with Equifax (1-800-525-6285), Experian (1-888-397-3742), or TransUnion (1-800-680-7289)",
            "bank_call": "Call your bank using the number on the BACK of your card (not any number the caller gave you)",
            "change_passwords": "Change passwords for any accounts you discussed on the call",
            "monitor_accounts": "Monitor your bank and credit card statements for 90 days",
        },
    },
    "ID": {
        "name": "Indonesia",
        "flag": "🇮🇩",
        "emergency": "110",
        "actions": {
            "block_number": "Blokir nomor penelepon di pengaturan HP Anda",
            "report_police": "Laporkan ke Bareskrim Polri: patrolisiber.id atau hubungi 110",
            "report_ojk": "Laporkan ke OJK: 157 atau konsumen@ojk.go.id",
            "report_bi": "Hubungi Bank Indonesia: 131",
            "bank_call": "Hubungi bank Anda menggunakan nomor di BELAKANG kartu ATM (bukan nomor yang diberikan penelepon)",
            "block_rekening": "Minta bank untuk blokir sementara rekening jika sudah transfer",
            "change_passwords": "Ganti password semua akun yang dibicarakan",
            "cek_pinjol": "Jika terkait pinjol, laporkan ke OJK dan cek di ifnb.ojk.go.id",
        },
    },
    "SG": {
        "name": "Singapore",
        "flag": "🇸🇬",
        "emergency": "999",
        "actions": {
            "block_number": "Block the caller's number",
            "report_police": "Report to Singapore Police: call 1800-255-0000 or file at epc.spf.gov.sg",
            "scamshield": "Report via ScamShield app (available on App Store / Google Play)",
            "bank_call": "Call your bank's fraud hotline immediately (number on back of card)",
            "ncpc": "Check NCPC ScamAlert: scamalert.sg",
        },
    },
    "CN": {
        "name": "China",
        "flag": "🇨🇳",
        "emergency": "110",
        "actions": {
            "block_number": "屏蔽来电号码",
            "report_police": "拨打110报警或到当地派出所报案",
            "report_app": "使用国家反诈中心APP举报",
            "bank_call": "拨打银行客服电话（使用银行卡背面号码）",
            "freeze_account": "如已转账，立即请求银行冻结账户",
        },
    },
    "JP": {
        "name": "Japan",
        "flag": "🇯🇵",
        "emergency": "110",
        "actions": {
            "block_number": "発信者番号をブロックしてください",
            "report_police": "警察に届出：#9110（相談ダイヤル）または110",
            "consumer_center": "消費者ホットライン：188",
            "bank_call": "カード裏面の番号で銀行に連絡してください",
        },
    },
    "KR": {
        "name": "South Korea",
        "flag": "🇰🇷",
        "emergency": "112",
        "actions": {
            "block_number": "발신자 번호를 차단하세요",
            "report_police": "경찰 사이버수사대 신고: 182 또는 112",
            "report_fss": "금융감독원 신고: 1332",
            "bank_call": "카드 뒷면의 번호로 은행에 연락하세요",
            "account_freeze": "이미 송금했다면 즉시 계좌 지급정지 요청",
        },
    },
    "ES": {
        "name": "Spain",
        "flag": "🇪🇸",
        "emergency": "112",
        "actions": {
            "block_number": "Bloquea el número del llamante",
            "report_police": "Denuncia ante la Guardia Civil (062) o Policía Nacional (091)",
            "bank_call": "Llama a tu banco usando el número del reverso de tu tarjeta",
            "incibe": "Reporta a INCIBE: 017 (línea gratuita de ciberseguridad)",
        },
    },
    "FR": {
        "name": "France",
        "flag": "🇫🇷",
        "emergency": "17",
        "actions": {
            "block_number": "Bloquez le numéro de l'appelant",
            "report_police": "Déposez plainte: commissariat ou gendarmerie",
            "report_pharos": "Signalez sur internet-signalement.gouv.fr",
            "bank_call": "Appelez votre banque avec le numéro au dos de votre carte",
            "info_escroqueries": "Info Escroqueries: 0 805 805 817 (gratuit)",
        },
    },
    "IN": {
        "name": "India",
        "flag": "🇮🇳",
        "emergency": "112",
        "actions": {
            "block_number": "Block the caller's number",
            "report_cybercrime": "Report on cybercrime.gov.in or call 1930 (Cyber Crime Helpline)",
            "report_rbi": "If banking fraud: RBI Sachet Portal (sachet.rbi.org.in)",
            "bank_call": "Call your bank's fraud helpline (number on back of card)",
            "chakshu": "Report suspected fraud calls on Chakshu portal: sancharsaathi.gov.in",
            "freeze_upi": "If UPI fraud: contact your bank to freeze UPI ID immediately",
        },
    },
}

# Map scam patterns to relevant action subsets
PATTERN_ACTION_PRIORITY = {
    "OTP / Credential Extraction": ["bank_call", "change_passwords", "credit_freeze", "block_number"],
    "Safe Account Transfer": ["bank_call", "block_rekening", "account_freeze", "freeze_account", "block_number"],
    "Gift Card Demand": ["block_number", "report_ftc", "report_police"],
    "Crypto Transfer Scam": ["block_number", "report_fbi", "report_police"],
    "Bank Impersonation": ["bank_call", "change_passwords", "block_number"],
    "Government Impersonation": ["block_number", "report_police", "report_ftc"],
    "Tech Support Impersonation": ["change_passwords", "block_number", "report_ftc"],
    "Remote Access Takeover": ["change_passwords", "bank_call", "monitor_accounts", "block_number"],
    "Investment Fraud": ["bank_call", "report_fbi", "report_police", "block_number"],
    "Digital Arrest (IN/SEA)": ["block_number", "report_cybercrime", "report_police"],
    "Pinjol Harassment (ID)": ["report_ojk", "report_police", "cek_pinjol", "block_number"],
}


class ActionAgentService:
    """Generates personalized anti-scam action plans."""

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
            logger.info("[ActionAgent] Model ready")
        except Exception as e:
            logger.error(f"[ActionAgent] Init failed: {e}")

    def generate_action_plan(
        self,
        scam_pattern: str,
        severity: str,
        country_code: str = "US",
        threat_score: int = 0,
        compromised_info: Optional[list] = None,
        interventions: Optional[list] = None,
    ) -> dict:
        """
        Generate a step-by-step action plan.

        Args:
            scam_pattern: Detected scam type
            severity: critical/high/medium/low
            country_code: ISO country code
            threat_score: Final threat score (0-100)
            compromised_info: List of what user may have shared (otp, password, bank_details, etc.)
            interventions: List of intervention events from session

        Returns:
            dict with steps, urgency, country_resources, estimated_time
        """
        country = COUNTRY_RESOURCES.get(country_code, COUNTRY_RESOURCES["US"])
        compromised = compromised_info or []

        # Build prioritized action steps
        steps = []
        step_num = 0

        # Step 1: Always block the number first
        step_num += 1
        steps.append({
            "step": step_num,
            "action": country["actions"].get("block_number", "Block the caller's number"),
            "icon": "📵",
            "urgency": "immediate",
            "completed": False,
        })

        # Step 2: If money was transferred, bank call is URGENT
        if any(x in compromised for x in ["transfer", "bank_details", "otp"]):
            step_num += 1
            bank_action = country["actions"].get("bank_call", "Call your bank immediately")
            steps.append({
                "step": step_num,
                "action": bank_action,
                "icon": "🏦",
                "urgency": "critical",
                "completed": False,
            })

            # Account freeze if available
            for freeze_key in ["block_rekening", "account_freeze", "freeze_account", "freeze_upi"]:
                if freeze_key in country["actions"]:
                    step_num += 1
                    steps.append({
                        "step": step_num,
                        "action": country["actions"][freeze_key],
                        "icon": "🔒",
                        "urgency": "critical",
                        "completed": False,
                    })
                    break

        # Step 3: Pattern-specific priority actions
        priority_actions = PATTERN_ACTION_PRIORITY.get(scam_pattern, [])
        added_keys = {"block_number", "bank_call"}  # Already added

        for action_key in priority_actions:
            if action_key in added_keys:
                continue
            if action_key in country["actions"]:
                step_num += 1
                icon_map = {
                    "change_passwords": "🔑",
                    "credit_freeze": "❄️",
                    "monitor_accounts": "👁️",
                    "report_ftc": "📋",
                    "report_fbi": "🏛️",
                    "report_police": "🚔",
                    "report_ojk": "📋",
                    "report_bi": "🏛️",
                    "report_cybercrime": "💻",
                    "scamshield": "🛡️",
                    "cek_pinjol": "📱",
                }
                steps.append({
                    "step": step_num,
                    "action": country["actions"][action_key],
                    "icon": icon_map.get(action_key, "📋"),
                    "urgency": "high" if step_num <= 3 else "recommended",
                    "completed": False,
                })
                added_keys.add(action_key)

        # Step 4: Add remaining country-specific reporting actions
        for key, action_text in country["actions"].items():
            if key not in added_keys and key.startswith("report"):
                step_num += 1
                steps.append({
                    "step": step_num,
                    "action": action_text,
                    "icon": "📋",
                    "urgency": "recommended",
                    "completed": False,
                })
                added_keys.add(key)

        # Step 5: If passwords were compromised
        if "password" in compromised or "credentials" in compromised:
            if "change_passwords" not in added_keys and "change_passwords" in country["actions"]:
                step_num += 1
                steps.append({
                    "step": step_num,
                    "action": country["actions"]["change_passwords"],
                    "icon": "🔑",
                    "urgency": "high",
                    "completed": False,
                })

        # Step 6: Always end with monitoring
        if "monitor_accounts" in country["actions"] and "monitor_accounts" not in added_keys:
            step_num += 1
            steps.append({
                "step": step_num,
                "action": country["actions"]["monitor_accounts"],
                "icon": "👁️",
                "urgency": "ongoing",
                "completed": False,
            })

        # Urgency classification
        if severity == "critical" or threat_score >= 75:
            urgency_level = "CRITICAL"
            urgency_message = "Act within the next 15 minutes. Time is critical."
            estimated_time = "15-30 minutes"
        elif severity == "high" or threat_score >= 45:
            urgency_level = "HIGH"
            urgency_message = "Complete these steps within the next hour."
            estimated_time = "30-60 minutes"
        else:
            urgency_level = "MODERATE"
            urgency_message = "Complete these steps today."
            estimated_time = "1-2 hours"

        # Intervention summary
        intervention_summary = None
        if interventions:
            intervention_summary = {
                "total": len(interventions),
                "highest_level": max(
                    interventions,
                    key=lambda x: {"WARN": 1, "BLOCK": 2, "LOCKDOWN": 3}.get(x.get("level", "WARN"), 0),
                ).get("level", "WARN"),
                "user_actions": [i.get("user_action", "unknown") for i in interventions],
            }

        return {
            "type": "action_plan",
            "urgency_level": urgency_level,
            "urgency_message": urgency_message,
            "estimated_time": estimated_time,
            "scam_pattern": scam_pattern,
            "severity": severity,
            "threat_score": threat_score,
            "country": {
                "code": country_code,
                "name": country["name"],
                "flag": country["flag"],
                "emergency": country["emergency"],
            },
            "steps": steps,
            "total_steps": len(steps),
            "compromised_info": compromised,
            "intervention_summary": intervention_summary,
            "disclaimer": "VoxGuard provides guidance only. Contact your bank and local authorities for official support.",
        }

    async def generate_ai_enhanced_plan(
        self,
        base_plan: dict,
        transcript_summary: str = "",
    ) -> dict:
        """
        Optionally enhance the action plan with AI-generated personalized advice.
        Adds a 'personalized_advice' field to the base plan.
        """
        if not self._model or not transcript_summary:
            return base_plan

        try:
            prompt = f"""Based on this scam call summary, provide 2-3 sentences of personalized advice.
Scam type: {base_plan.get('scam_pattern')}
Severity: {base_plan.get('severity')}
Country: {base_plan.get('country', {}).get('name')}
Transcript summary: {transcript_summary[:300]}

Be specific, practical, and reassuring. The victim just ended a scam call and needs clear guidance.
Respond with plain text only, no JSON or markdown."""

            response = await self._model.generate_content_async(prompt)
            advice = response.text.strip()

            base_plan["personalized_advice"] = advice
            return base_plan

        except Exception as e:
            logger.error(f"[ActionAgent] AI enhancement error: {e}")
            return base_plan
