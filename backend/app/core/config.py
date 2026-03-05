from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # ── App ───────────────────────────────────────────────────
    app_name: str = "Scam Shield API"
    app_version: str = "1.0.0"
    debug: bool = False

    # ── Server ────────────────────────────────────────────────
    backend_host: str = "0.0.0.0"
    backend_port: int = 8000
    backend_cors_origins: str = "http://localhost:5173"

    # ── Google AI ─────────────────────────────────────────────
    google_api_key: str = ""
    google_cloud_project: str = ""
    gemini_model: str = "gemini-2.0-flash-live-001"
    gemini_vision_model: str = "gemini-2.0-flash-001"
    max_tokens: int = 1024

    # ── Audio processing ──────────────────────────────────────
    audio_sample_rate: int = 16000
    audio_chunk_ms: int = 250

    class Config:
        env_file = ".env"
        case_sensitive = False

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.backend_cors_origins.split(",")]


@lru_cache()
def get_settings() -> Settings:
    return Settings()
