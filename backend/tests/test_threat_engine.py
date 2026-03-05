"""
tests/test_threat_engine.py
───────────────────────────
Unit tests for the ThreatEngine composite scoring logic.
Run: pytest tests/ -v
"""

import pytest
from app.services.threat_engine import ThreatEngine, SessionState


def test_session_init():
    engine = ThreatEngine()
    assert engine.session.threat_score == 8
    assert engine.session.threat_level == "safe"
    assert len(engine.session.alerts) == 0


def test_no_scam_returns_none():
    engine = ThreatEngine()
    result = engine.ingest_audio_result({"is_scam": False})
    assert result is None


def test_critical_scam_produces_alert():
    engine = ThreatEngine()
    result = engine.ingest_audio_result({
        "is_scam": True,
        "severity": "critical",
        "confidence": 97,
        "pattern": "Bank Impersonation",
        "quote": "Your account will be frozen",
        "tactics": ["AUTHORITY", "FEAR"],
    })
    assert result is not None
    assert result["type"] == "threat_alert"
    assert result["alert"]["severity"] == "critical"
    assert engine.session.threat_score > 8
    assert len(engine.session.alerts) == 1


def test_psych_scores_update():
    engine = ThreatEngine()
    engine.ingest_audio_result({
        "is_scam": True,
        "severity": "high",
        "confidence": 90,
        "pattern": "Artificial Urgency",
        "quote": "Act now or lose everything",
        "tactics": ["SCARCITY", "FEAR"],
    })
    assert engine.session.psych_scores["SCARCITY"] > 0
    assert engine.session.psych_scores["FEAR"] > 0
    assert engine.session.psych_scores["AUTHORITY"] == 0  # Not triggered


def test_composite_score_formula():
    engine = ThreatEngine()
    engine.session.language_risk   = 100
    engine.session.behavioral_risk = 100
    engine.session.visual_risk     = 100
    engine._recompute_score()
    assert engine.session.threat_score == 99  # Capped at 99


def test_threat_level_thresholds():
    engine = ThreatEngine()
    engine.session.threat_score = 10;  assert engine.session.threat_level == "safe"
    engine.session.threat_score = 30;  assert engine.session.threat_level == "medium"
    engine.session.threat_score = 60;  assert engine.session.threat_level == "high"
    engine.session.threat_score = 80;  assert engine.session.threat_level == "critical"


def test_score_update_message():
    engine = ThreatEngine()
    msg = engine.score_update()
    assert msg["type"] == "score_update"
    assert "threat_score" in msg
    assert "language_risk" in msg
