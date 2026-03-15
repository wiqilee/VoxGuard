"""
app.services.storage_service
─────────────────────────────
Persists session data to Cloud Firestore and audio recordings to
Cloud Storage for forensic export and replay.

Cloud Firestore:
  - Collection: "sessions"
  - Documents: session_id → full session state, alerts, interventions,
    psych scores, lie scores, transcript, action plan

Cloud Storage:
  - Bucket: configured via STORAGE_BUCKET env var
  - Path: sessions/{session_id}/recording.webm

Both services are optional. If credentials or configuration are missing,
operations gracefully fall back to no-ops with warning logs.
"""

import json
import logging
import time
from typing import Optional

from app.core.config import get_settings

logger = logging.getLogger(__name__)
_settings = get_settings()


class StorageService:
    """Handles persistence to Cloud Firestore and Cloud Storage."""

    def __init__(self):
        self._firestore_client = None
        self._storage_client = None
        self._bucket = None
        self._init_firestore()
        self._init_storage()

    # ── Initialization ─────────────────────────────────────────

    def _init_firestore(self):
        if not _settings.firestore_enabled:
            logger.info("[StorageService] Firestore disabled by config")
            return
        try:
            from google.cloud import firestore

            self._firestore_client = firestore.AsyncClient(
                project=_settings.google_cloud_project or None,
            )
            logger.info(
                "[StorageService] Firestore ready (project=%s)",
                _settings.google_cloud_project or "default",
            )
        except Exception as e:
            logger.warning("[StorageService] Firestore init failed: %s", e)

    def _init_storage(self):
        if not _settings.storage_enabled:
            logger.info("[StorageService] Cloud Storage disabled by config")
            return
        if not _settings.storage_bucket:
            logger.warning("[StorageService] No STORAGE_BUCKET configured")
            return
        try:
            from google.cloud import storage

            self._storage_client = storage.Client(
                project=_settings.google_cloud_project or None,
            )
            self._bucket = self._storage_client.bucket(_settings.storage_bucket)
            logger.info(
                "[StorageService] Cloud Storage ready (bucket=%s)",
                _settings.storage_bucket,
            )
        except Exception as e:
            logger.warning("[StorageService] Cloud Storage init failed: %s", e)

    # ── Firestore: Session Persistence ─────────────────────────

    @property
    def firestore_available(self) -> bool:
        return self._firestore_client is not None

    @property
    def storage_available(self) -> bool:
        return self._bucket is not None

    async def save_session(self, session_data: dict) -> bool:
        """
        Save or update a session document in Firestore.

        Args:
            session_data: Full session state dict including:
                - session_id, start_time, threat_score, threat_level
                - alerts (list), interventions (list)
                - psych_scores, lie_scores
                - transcript_buffer
                - language, country_code

        Returns:
            True if saved successfully, False otherwise.
        """
        if not self._firestore_client:
            return False

        session_id = session_data.get("session_id")
        if not session_id:
            logger.warning("[StorageService] No session_id, skipping save")
            return False

        try:
            doc_ref = self._firestore_client.collection("sessions").document(
                session_id
            )

            # Prepare document — Firestore doesn't accept sets
            doc = {
                "session_id": session_id,
                "start_time": session_data.get("start_time"),
                "updated_at": time.time(),
                "threat_score": session_data.get("threat_score", 0),
                "threat_level": session_data.get("threat_level", "safe"),
                "alerts_count": len(session_data.get("alerts", [])),
                "interventions_count": len(session_data.get("interventions", [])),
                "alerts": session_data.get("alerts", []),
                "interventions": session_data.get("interventions", []),
                "psych_scores": session_data.get("psych_scores", {}),
                "lie_scores": session_data.get("lie_scores", {}),
                "detected_patterns": list(
                    session_data.get("detected_patterns", [])
                ),
                "language": session_data.get("language", "en"),
                "country_code": session_data.get("country_code", "US"),
                "transcript_length": len(
                    session_data.get("transcript_buffer", "")
                ),
            }

            await doc_ref.set(doc, merge=True)

            logger.info(
                "[StorageService] Session %s saved to Firestore "
                "(score=%d, alerts=%d, interventions=%d)",
                session_id,
                doc["threat_score"],
                doc["alerts_count"],
                doc["interventions_count"],
            )
            return True

        except Exception as e:
            logger.error("[StorageService] Firestore save error: %s", e)
            return False

    async def save_transcript(self, session_id: str, transcript: str) -> bool:
        """Save the full transcript as a subcollection document."""
        if not self._firestore_client or not session_id:
            return False

        try:
            doc_ref = (
                self._firestore_client.collection("sessions")
                .document(session_id)
                .collection("artifacts")
                .document("transcript")
            )
            await doc_ref.set(
                {
                    "session_id": session_id,
                    "transcript": transcript,
                    "updated_at": time.time(),
                }
            )
            logger.info(
                "[StorageService] Transcript saved (%d chars)", len(transcript)
            )
            return True
        except Exception as e:
            logger.error("[StorageService] Transcript save error: %s", e)
            return False

    async def save_action_plan(
        self, session_id: str, action_plan: dict
    ) -> bool:
        """Save the action plan as a subcollection document."""
        if not self._firestore_client or not session_id:
            return False

        try:
            doc_ref = (
                self._firestore_client.collection("sessions")
                .document(session_id)
                .collection("artifacts")
                .document("action_plan")
            )
            await doc_ref.set(
                {
                    "session_id": session_id,
                    "action_plan": action_plan,
                    "created_at": time.time(),
                }
            )
            logger.info("[StorageService] Action plan saved for %s", session_id)
            return True
        except Exception as e:
            logger.error("[StorageService] Action plan save error: %s", e)
            return False

    async def get_session(self, session_id: str) -> Optional[dict]:
        """Retrieve a session from Firestore."""
        if not self._firestore_client or not session_id:
            return None

        try:
            doc_ref = self._firestore_client.collection("sessions").document(
                session_id
            )
            doc = await doc_ref.get()
            if doc.exists:
                return doc.to_dict()
            return None
        except Exception as e:
            logger.error("[StorageService] Firestore get error: %s", e)
            return None

    # ── Cloud Storage: Audio Recordings ────────────────────────

    async def upload_audio(
        self, session_id: str, audio_data: bytes, content_type: str = "audio/webm"
    ) -> Optional[str]:
        """
        Upload session audio recording to Cloud Storage.

        Args:
            session_id: Session identifier
            audio_data: Raw audio bytes (WebM or MP4)
            content_type: MIME type of the audio

        Returns:
            Public URL or GCS URI of the uploaded file, or None on failure.
        """
        if not self._bucket:
            return None

        if not audio_data or not session_id:
            return None

        try:
            ext = "webm" if "webm" in content_type else "mp4"
            blob_path = f"sessions/{session_id}/recording.{ext}"
            blob = self._bucket.blob(blob_path)

            blob.upload_from_string(audio_data, content_type=content_type)

            gcs_uri = f"gs://{self._bucket.name}/{blob_path}"

            logger.info(
                "[StorageService] Audio uploaded: %s (%d bytes)",
                gcs_uri,
                len(audio_data),
            )
            return gcs_uri

        except Exception as e:
            logger.error("[StorageService] Audio upload error: %s", e)
            return None

    async def get_audio_url(self, session_id: str) -> Optional[str]:
        """
        Get a signed URL for a session's audio recording.

        Returns:
            Signed URL valid for 1 hour, or None if not found.
        """
        if not self._bucket or not session_id:
            return None

        try:
            import datetime

            for ext in ("webm", "mp4"):
                blob_path = f"sessions/{session_id}/recording.{ext}"
                blob = self._bucket.blob(blob_path)
                if blob.exists():
                    url = blob.generate_signed_url(
                        expiration=datetime.timedelta(hours=1),
                        method="GET",
                    )
                    return url
            return None
        except Exception as e:
            logger.error("[StorageService] Signed URL error: %s", e)
            return None
