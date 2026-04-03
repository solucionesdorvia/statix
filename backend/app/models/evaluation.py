from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from sqlalchemy import JSON, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class ClinicalEvaluation(Base):
    """Auditoría: una fila por evaluación enviada desde el formulario."""

    __tablename__ = "clinical_evaluations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )
    input_payload: Mapped[dict[str, Any]] = mapped_column(JSON)
    output_payload: Mapped[dict[str, Any]] = mapped_column(JSON)
    patient_snapshot: Mapped[dict[str, Any]] = mapped_column(JSON)
