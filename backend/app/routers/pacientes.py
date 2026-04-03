import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.evaluation import ClinicalEvaluation
from app.schemas.paciente import EvaluacionResponse, PacienteCreate, PatientSnapshot
from app.services.decision_engine import evaluate_patient
from app.utils.clinical_format import format_inicio_sintomas, format_tiempo_desde_inicio_label

router = APIRouter(prefix="/pacientes", tags=["pacientes"])


def _minutes_since_onset(inicio_sintomas: str) -> tuple[int, bool]:
    """Minutos desde inicio hasta ahora; bool = tiempo interpretable (no futuro)."""
    raw = inicio_sintomas.strip()
    try:
        if raw.endswith("Z"):
            raw = raw[:-1] + "+00:00"
        onset = datetime.fromisoformat(raw)
    except ValueError:
        return 0, False

    now = datetime.now(onset.tzinfo) if onset.tzinfo else datetime.now()
    delta_sec = (now - onset).total_seconds()
    if delta_sec < 0:
        return 0, False
    return max(0, int(delta_sec // 60)), True


def _build_patient_snapshot(
    payload: PacienteCreate,
    onset_minutes: int,
    onset_valid: bool,
) -> PatientSnapshot:
    return PatientSnapshot(
        edad=payload.edad,
        sexo=payload.sexo,
        nihss=payload.nihss,
        aspects=payload.aspects,
        lvo=payload.lvo,
        inicio_sintomas_texto=format_inicio_sintomas(payload.inicio_sintomas),
        tiempo_desde_inicio=format_tiempo_desde_inicio_label(onset_minutes, onset_valid),
    )


def _row_to_response(row: ClinicalEvaluation) -> EvaluacionResponse:
    out = row.output_payload
    snap = row.patient_snapshot
    return EvaluacionResponse(
        id=row.id,
        recommendation=out["recommendation"],
        confidence=out["confidence"],
        reasons=out["reasons"],
        urgent=out["urgent"],
        patient=PatientSnapshot(**snap),
        created_at=row.created_at,
    )


@router.post("", response_model=EvaluacionResponse)
def crear_evaluacion_paciente(
    payload: PacienteCreate,
    db: Session = Depends(get_db),
) -> EvaluacionResponse:
    lvo_si = payload.lvo == "Sí"
    lvo_indeterminate = payload.lvo == "No determinado"
    onset_minutes, onset_valid = _minutes_since_onset(payload.inicio_sintomas)

    data = {
        "nihss": payload.nihss,
        "aspects": payload.aspects,
        "lvo": lvo_si,
        "onset_minutes": onset_minutes,
        "age": payload.edad,
        "received_tpa": payload.recibio_tpa == "Sí",
        "lvo_indeterminate": lvo_indeterminate,
        "onset_valid": onset_valid,
    }

    result = evaluate_patient(data)
    eval_id = str(uuid.uuid4())
    patient = _build_patient_snapshot(payload, onset_minutes, onset_valid)

    output_payload = {
        "recommendation": result["recommendation"],
        "confidence": result["confidence"],
        "reasons": result["reasons"],
        "urgent": result["urgent"],
    }

    row = ClinicalEvaluation(
        id=eval_id,
        input_payload=payload.model_dump(mode="json"),
        output_payload=output_payload,
        patient_snapshot=patient.model_dump(mode="json"),
    )
    db.add(row)
    db.commit()
    db.refresh(row)

    return _row_to_response(row)


@router.get("/{eval_id}", response_model=EvaluacionResponse)
def obtener_evaluacion(eval_id: str, db: Session = Depends(get_db)) -> EvaluacionResponse:
    row = db.get(ClinicalEvaluation, eval_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Evaluación no encontrada")
    return _row_to_response(row)
