"""
app.services.threat_engine
──────────────────────────
Computes a composite Threat Score (0-100) from three signal sources:

  Threat Score = (0.45 x Language Risk) + (0.35 x Behavioral Risk) + (0.20 x Visual Risk)

Maintains session state: alert history, psych tactic scores,
pattern hit tracking, peak threat level, and LIVE INTERVENTION triggers.

Intervention Levels:
  WARN     (score >= 55)  — Passive warning banner
  BLOCK    (score >= 75)  — Active blocking overlay with verification challenge
  LOCKDOWN (score >= 90)  — Full-screen lockdown with safe exit actions only

Instant intervention fires for high-lethality patterns (OTP extraction,
safe account transfer, gift card demand, crypto transfer) regardless of
cumulative score.
"""

import time
import uuid
from dataclasses import dataclass, field
from typing import Optional


# Patterns that trigger BLOCK-level intervention immediately on first detection
INSTANT_INTERVENTION_PATTERNS = {
    "OTP / Credential Extraction",
    "Safe Account Transfer",
    "Gift Card Demand",
    "Crypto Transfer Scam",
    # Localized equivalents
    "Pencurian OTP / Kredensial",
    "安全账户转账",
    "OTP チョリ",
    "OTP 도용",
    "سرقة بيانات",
    "OTP चोरी",
    "Robo de Credenciales",
}

INTERVENTION_THRESHOLDS = {
    "WARN": 55,
    "BLOCK": 75,
    "LOCKDOWN": 90,
}


@dataclass
class Alert:
    id: str
    time: str
    severity: str
    pattern: str
    quote: str
    confidence: int
    tactics: list[str]
    source: str = "Gemini AI"
    timestamp: float = field(default_factory=time.time)
    triggered_intervention: bool = False


@dataclass
class InterventionEvent:
    """Tracks each intervention fired during a session."""
    id: str
    level: str          # WARN | BLOCK | LOCKDOWN
    trigger: str        # "score_threshold" | "instant_pattern"
    pattern: str        # which alert pattern caused it
    threat_score: int
    timestamp: float = field(default_factory=time.time)
    user_action: str = ""  # "dismissed" | "challenge_passed" | "challenge_failed" | "safe_exit"


@dataclass
class SessionState:
    session_id: str = field(default_factory=lambda: str(uuid.uuid4())[:8].upper())
    start_time: float = field(default_factory=time.time)
    alerts: list[Alert] = field(default_factory=list)
    interventions: list[InterventionEvent] = field(default_factory=list)
    threat_score: int = 0
    language_risk: int = 0
    behavioral_risk: int = 0
    visual_risk: int = 0
    psych_scores: dict = field(default_factory=lambda: {
        "SCARCITY": 0, "AUTHORITY": 0, "FEAR": 0,
        "RECIPROCITY": 0, "ISOLATION": 0, "COMMITMENT": 0,
    })
    lie_scores: dict = field(default_factory=lambda: {
        "INCONSISTENCY": 0, "VAGUENESS": 0, "OVERDETAIL": 0,
        "DEFLECTION": 0, "PRESSURE": 0,
    })
    detected_patterns: set = field(default_factory=set)
    transcript_buffer: str = ""
    last_intervention_level: str = ""  # tracks highest intervention fired

    @property
    def session_seconds(self) -> int:
        return int(time.time() - self.start_time)

    @property
    def session_time_fmt(self) -> str:
        s = self.session_seconds
        return f"{s // 60:02d}:{s % 60:02d}"

    @property
    def threat_level(self) -> str:
        if self.threat_score > 75:
            return "critical"
        if self.threat_score > 45:
            return "high"
        if self.threat_score > 20:
            return "medium"
        return "safe"


class ThreatEngine:
    SEVERITY_DELTA = {"critical": 45, "high": 30, "medium": 18, "low": 8}
    TACTIC_DELTA = 28

    def __init__(self):
        self.session = SessionState()

    # ── Core: evaluate whether an intervention should fire ──
    def _evaluate_intervention(self, pattern: str) -> Optional[dict]:
        score = self.session.threat_score
        trigger = None
        level = None

        # 1. Instant intervention for lethal patterns
        if pattern in INSTANT_INTERVENTION_PATTERNS:
            # At minimum BLOCK, escalate to LOCKDOWN if score already extreme
            level = "LOCKDOWN" if score >= INTERVENTION_THRESHOLDS["LOCKDOWN"] else "BLOCK"
            trigger = "instant_pattern"

        # 2. Score-based escalation (only if higher than last intervention)
        if not level:
            for lv in ("LOCKDOWN", "BLOCK", "WARN"):
                if score >= INTERVENTION_THRESHOLDS[lv]:
                    level = lv
                    trigger = "score_threshold"
                    break

        if not level:
            return None

        # Only fire if this level is equal to or higher than the last one fired
        level_rank = {"WARN": 1, "BLOCK": 2, "LOCKDOWN": 3}
        last_rank = level_rank.get(self.session.last_intervention_level, 0)
        current_rank = level_rank.get(level, 0)

        # Always fire for instant patterns; for score-based, only escalate
        if trigger == "score_threshold" and current_rank <= last_rank:
            return None

        self.session.last_intervention_level = level

        event = InterventionEvent(
            id=f"INT-{len(self.session.interventions)+1}",
            level=level,
            trigger=trigger,
            pattern=pattern,
            threat_score=score,
        )
        self.session.interventions.append(event)

        return {
            "type": "intervention",
            "intervention": {
                "id": event.id,
                "level": level,
                "trigger": trigger,
                "pattern": pattern,
                "threat_score": score,
                "timestamp": event.timestamp,
            },
        }

    def ingest_audio_result(self, gemini_result: dict) -> dict:
        """Returns a dict with alert info and optional intervention."""
        response = {"alert": None, "intervention": None}

        if not gemini_result.get("is_scam"):
            # No scam detected in this chunk, do not change scores
            return response

        severity = gemini_result.get("severity", "medium")
        confidence = gemini_result.get("confidence", 70)
        pattern = gemini_result.get("pattern", "Unknown Pattern")
        tactics = gemini_result.get("tactics", [])
        lie_indicators = gemini_result.get("lie_indicators", [])

        delta = self.SEVERITY_DELTA.get(severity, 12)
        # Cumulative bonus: each subsequent detection adds more weight
        alert_count = len(self.session.alerts)
        cumulative_bonus = min(20, alert_count * 5)
        self.session.language_risk = min(100, self.session.language_risk + delta + cumulative_bonus)

        if tactics:
            tactic_boost = self.TACTIC_DELTA * len(tactics)
            self.session.behavioral_risk = min(
                100, self.session.behavioral_risk + tactic_boost
            )

        for t in tactics:
            key = t.upper()
            if key in self.session.psych_scores:
                self.session.psych_scores[key] = min(100, self.session.psych_scores[key] + self.TACTIC_DELTA)

        for li in lie_indicators:
            key = li.upper()
            if key in self.session.lie_scores:
                self.session.lie_scores[key] = min(100, self.session.lie_scores[key] + self.TACTIC_DELTA)

        self._recompute_score()
        self.session.detected_patterns.add(pattern)

        # Check if intervention should fire
        intervention = self._evaluate_intervention(pattern)

        alert = Alert(
            id=str(len(self.session.alerts) + 1),
            time=self.session.session_time_fmt,
            severity=severity,
            pattern=pattern,
            quote=gemini_result.get("quote", ""),
            confidence=min(99, confidence),
            tactics=tactics,
            source="Gemini Live API",
            triggered_intervention=intervention is not None,
        )
        self.session.alerts.append(alert)

        response["alert"] = {
            "type": "threat_alert",
            "alert": {
                "id": len(self.session.alerts),
                "time": alert.time,
                "severity": alert.severity,
                "pattern": alert.pattern,
                "quote": alert.quote,
                "confidence": alert.confidence,
                "tactics": alert.tactics,
                "source": alert.source,
                "triggered_intervention": alert.triggered_intervention,
            },
            "threat_score": self.session.threat_score,
            "threat_level": self.session.threat_level,
            "tactics": tactics,
            "tactic_delta": self.TACTIC_DELTA,
            "psych_scores": self.session.psych_scores,
            "lie_scores": self.session.lie_scores,
        }
        response["intervention"] = intervention
        return response

    def record_intervention_action(self, intervention_id: str, user_action: str):
        """Records how the user responded to an intervention."""
        for event in self.session.interventions:
            if event.id == intervention_id:
                event.user_action = user_action
                break

    def ingest_vision_result(self, vision_result: dict) -> Optional[dict]:
        if not vision_result.get("threat_detected"):
            return None
        severity = vision_result.get("severity", "medium")
        delta = self.SEVERITY_DELTA.get(severity, 10) // 2
        self.session.visual_risk = min(100, self.session.visual_risk + delta)
        self._recompute_score()
        return {
            "type": "visual_threat",
            "threat_score": self.session.threat_score,
            "threat_level": self.session.threat_level,
            "visual_threat": vision_result.get("visual_threat_type"),
            "confidence": vision_result.get("confidence", 70),
        }

    def score_update(self) -> dict:
        return {
            "type": "score_update",
            "threat_score": self.session.threat_score,
            "threat_level": self.session.threat_level,
            "language_risk": self.session.language_risk,
            "behavioral_risk": self.session.behavioral_risk,
            "visual_risk": self.session.visual_risk,
            "psych_scores": self.session.psych_scores,
            "lie_scores": self.session.lie_scores,
        }

    def session_summary(self) -> dict:
        """Full session summary including intervention history."""
        return {
            "type": "session_summary",
            "threat_score": self.session.threat_score,
            "alerts_count": len(self.session.alerts),
            "interventions_count": len(self.session.interventions),
            "interventions": [
                {
                    "id": e.id,
                    "level": e.level,
                    "trigger": e.trigger,
                    "pattern": e.pattern,
                    "threat_score": e.threat_score,
                    "user_action": e.user_action,
                }
                for e in self.session.interventions
            ],
            "psych_scores": self.session.psych_scores,
            "lie_scores": self.session.lie_scores,
        }

    def _recompute_score(self):
        self.session.threat_score = min(
            99,
            int(
                0.45 * self.session.language_risk
                + 0.35 * self.session.behavioral_risk
                + 0.20 * self.session.visual_risk
            ),
        )