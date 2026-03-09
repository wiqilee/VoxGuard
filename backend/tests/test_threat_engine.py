"""
tests/test_threat_engine.py
"""

import pytest
from app.services.threat_engine import ThreatEngine


def test_session_init():
    engine = ThreatEngine()
    assert engine.session.threat_score == 8
    assert engine.session.threat_level == "safe"
    assert len(engine.session.alerts) == 0


def test_no_scam_returns_none():
    engine = ThreatEngine()
    result = engine.ingest_audio_result({"is_scam": False})
    assert result["alert"] is None
    assert result["intervention"] is None


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
    assert result["alert"] is not None
    assert result["alert"]["type"] == "threat_alert"
    assert result["alert"]["alert"]["severity"] == "critical"
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
    assert engine.session.psych_scores["AUTHORITY"] == 0


def test_composite_score_formula():
    engine = ThreatEngine()
    engine.session.language_risk = 100
    engine.session.behavioral_risk = 100
    engine.session.visual_risk = 100
    engine._recompute_score()
    assert engine.session.threat_score == 99


def test_score_update_message():
    engine = ThreatEngine()
    msg = engine.score_update()
    assert msg["type"] == "score_update"
    assert "threat_score" in msg
    assert "language_risk" in msg


def test_instant_intervention_fires():
    """OTP extraction triggers immediate BLOCK intervention."""
    engine = ThreatEngine()
    result = engine.ingest_audio_result({
        "is_scam": True,
        "severity": "critical",
        "confidence": 99,
        "pattern": "OTP / Credential Extraction",
        "quote": "Read me the code",
        "tactics": ["AUTHORITY", "COMMITMENT"],
    })
    assert result["intervention"] is not None
    assert result["intervention"]["intervention"]["level"] == "BLOCK"
    assert result["intervention"]["intervention"]["trigger"] == "instant_pattern"
    assert result["alert"]["alert"]["triggered_intervention"] is True
    assert len(engine.session.interventions) == 1


def test_intervention_not_fired_low_score():
    """Low-severity scam below threshold should not trigger intervention."""
    engine = ThreatEngine()
    result = engine.ingest_audio_result({
        "is_scam": True,
        "severity": "low",
        "confidence": 50,
        "pattern": "Suspicious Behavior",
        "quote": "Something odd",
        "tactics": ["FEAR"],
    })
    assert result["alert"] is not None
    assert result["intervention"] is None
    assert len(engine.session.interventions) == 0


def test_record_intervention_action():
    """User response to intervention is recorded."""
    engine = ThreatEngine()
    engine.ingest_audio_result({
        "is_scam": True,
        "severity": "critical",
        "confidence": 99,
        "pattern": "OTP / Credential Extraction",
        "quote": "Read me the code",
        "tactics": ["AUTHORITY"],
    })
    assert len(engine.session.interventions) == 1
    engine.record_intervention_action("INT-1", "safe_exit")
    assert engine.session.interventions[0].user_action == "safe_exit"


def test_session_summary_includes_interventions():
    """Session summary includes intervention history."""
    engine = ThreatEngine()
    engine.ingest_audio_result({
        "is_scam": True,
        "severity": "critical",
        "confidence": 99,
        "pattern": "Safe Account Transfer",
        "quote": "Transfer to safe account",
        "tactics": ["AUTHORITY", "FEAR"],
    })
    summary = engine.session_summary()
    assert summary["interventions_count"] == 1
    assert summary["interventions"][0]["level"] == "BLOCK"
    assert summary["interventions"][0]["pattern"] == "Safe Account Transfer"
