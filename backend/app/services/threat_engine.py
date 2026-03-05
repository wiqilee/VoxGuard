"""
threat_engine.py
────────────────
Computes a composite Threat Score (0–100) from three signal sources:

  Threat Score = (0.45 × Language Risk) + (0.35 × Behavioral Risk) + (0.20 × Visual Risk)

Also maintains session state: alert history, psych tactic scores,
pattern hit tracking, and peak threat level.
"""

import time
import uuid
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class Alert:
    id: str
    time: str          # HH:MM formatted session time
    severity: str      # critical | high | medium | low
    pattern: str
    quote: str
    confidence: int    # 0–100
    tactics: list[str]
    source: str = "Gemini AI"
    timestamp: float = field(default_factory=time.time)


@dataclass
class SessionState:
    session_id: str = field(default_factory=lambda: str(uuid.uuid4())[:8].upper())
    start_time: float = field(default_factory=time.time)
    alerts: list[Alert] = field(default_factory=list)
    threat_score: int = 8
    language_risk: int = 0
    behavioral_risk: int = 0
    visual_risk: int = 0
    psych_scores: dict = field(default_factory=lambda: {
        "SCARCITY": 0, "AUTHORITY": 0, "FEAR": 0,
        "RECIPROCITY": 0, "ISOLATION": 0, "COMMITMENT": 0,
    })
    detected_patterns: set = field(default_factory=set)
    transcript_buffer: str = ""

    @property
    def session_seconds(self) -> int:
        return int(time.time() - self.start_time)

    @property
    def session_time_fmt(self) -> str:
        s = self.session_seconds
        return f"{s // 60:02d}:{s % 60:02d}"

    @property
    def threat_level(self) -> str:
        if self.threat_score > 75: return "critical"
        if self.threat_score > 45: return "high"
        if self.threat_score > 20: return "medium"
        return "safe"


class ThreatEngine:
    """
    Maintains per-session state and computes composite threat scores.
    One ThreatEngine instance per WebSocket session.
    """

    SEVERITY_DELTA = {
        "critical": 28,
        "high":     18,
        "medium":   10,
        "low":       5,
    }

    TACTIC_DELTA = 22  # Points added per psych tactic detection

    def __init__(self):
        self.session = SessionState()

    def ingest_audio_result(self, gemini_result: dict) -> Optional[dict]:
        """
        Process audio analysis result from Gemini.
        Returns an alert dict if a threat is detected, else None.
        """
        if not gemini_result.get("is_scam"):
            # Small passive increase in behavioral risk from continued conversation
            self.session.behavioral_risk = min(100, self.session.behavioral_risk + 1)
            self._recompute_score()
            return None

        severity   = gemini_result.get("severity", "medium")
        confidence = gemini_result.get("confidence", 70)
        pattern    = gemini_result.get("pattern", "Unknown Pattern")
        tactics    = gemini_result.get("tactics", [])

        # ── Update language risk ──────────────────────────────
        delta = self.SEVERITY_DELTA.get(severity, 12)
        self.session.language_risk = min(100, self.session.language_risk + delta)

        # ── Update behavioral risk from tactics ───────────────
        if tactics:
            self.session.behavioral_risk = min(
                100, self.session.behavioral_risk + self.TACTIC_DELTA * len(tactics) // 2
            )

        # ── Update psychological tactic scores ─────────────────
        tactic_deltas = {}
        for t in tactics:
            if t in self.session.psych_scores:
                prev = self.session.psych_scores[t]
                self.session.psych_scores[t] = min(100, prev + self.TACTIC_DELTA)
                tactic_deltas[t] = self.session.psych_scores[t] - prev

        # ── Recompute composite score ─────────────────────────
        self._recompute_score()

        # ── Track pattern hits ────────────────────────────────
        self.session.detected_patterns.add(pattern)

        # ── Build alert ───────────────────────────────────────
        alert = Alert(
            id=str(len(self.session.alerts) + 1),
            time=self.session.session_time_fmt,
            severity=severity,
            pattern=pattern,
            quote=gemini_result.get("quote", ""),
            confidence=min(99, confidence),
            tactics=tactics,
            source="Gemini Live API",
        )
        self.session.alerts.append(alert)

        return {
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
            },
            "threat_score": self.session.threat_score,
            "threat_level": self.session.threat_level,
            "tactics": tactics,
            "tactic_delta": self.TACTIC_DELTA,
            "psych_scores": self.session.psych_scores,
        }

    def ingest_vision_result(self, vision_result: dict) -> Optional[dict]:
        """
        Process screen frame analysis result.
        Returns a score_update message if visual threat found.
        """
        if not vision_result.get("threat_detected"):
            return None

        severity = vision_result.get("severity", "medium")
        delta    = self.SEVERITY_DELTA.get(severity, 10) // 2
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
        """Emit a periodic score update to the frontend."""
        return {
            "type": "score_update",
            "threat_score": self.session.threat_score,
            "threat_level": self.session.threat_level,
            "language_risk": self.session.language_risk,
            "behavioral_risk": self.session.behavioral_risk,
            "visual_risk": self.session.visual_risk,
        }

    def _recompute_score(self):
        """
        Composite threat score:
          45% language risk + 35% behavioral risk + 20% visual risk
        """
        self.session.threat_score = min(
            99,
            int(
                0.45 * self.session.language_risk
                + 0.35 * self.session.behavioral_risk
                + 0.20 * self.session.visual_risk
            ),
        )
