"""
app.core.config
───────────────
Application settings loaded from environment variables.
"""

from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "VoxGuard"
    app_version: str = "1.0.0"

    # Gemini
    google_api_key: str = ""
    gemini_model: str = "gemini-2.0-flash-live-001"
    gemini_vision_model: str = "gemini-2.0-flash-001"

    # Server
    backend_host: str = "0.0.0.0"
    backend_port: int = 8000
    backend_cors_origins: str = "http://localhost:5173,https://voxguard-kappa.vercel.app"
    debug: bool = False
    environment: str = "production"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.backend_cors_origins.split(",") if o.strip()]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
