from pydantic import BaseModel
from typing import Optional


class AlertModel(BaseModel):
    id: int
    time: str
    severity: str
    pattern: str
    quote: str
    confidence: int
    tactics: list[str]
    source: str = "Gemini Live API"


class SessionSummary(BaseModel):
    session_id: str
    duration: int
    alerts_count: int
    threat_score: int
    threat_level: str
    psych_scores: dict
    patterns_hit: list[str]
