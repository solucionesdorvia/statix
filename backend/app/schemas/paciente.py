from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

Sexo = Literal["Masculino", "Femenino"]
NivelConciencia = Literal["Alerta", "Somnoliento", "Estuporoso", "Coma"]
LVO = Literal["Sí", "No", "No determinado"]
RecibioTPA = Literal["Sí", "No"]


class PacienteCreate(BaseModel):
    edad: int = Field(..., ge=0, le=150)
    sexo: Sexo
    inicio_sintomas: str = Field(..., min_length=1)
    nihss: int = Field(..., ge=0, le=42)
    nivel_conciencia: NivelConciencia
    aspects: int = Field(..., ge=0, le=10)
    lvo: LVO
    tipos_estudio: list[str] = Field(default_factory=list)
    recibio_tpa: RecibioTPA
    presion_sistolica: int | None = Field(None, ge=0, le=400)
    glucemia: int | None = Field(None, ge=0, le=2000)
    anticoagulado: bool = False


RecommendationCode = Literal[
    "thrombectomy",
    "borderline",
    "no_thrombectomy",
    "inconclusive",
]
ConfidenceCode = Literal["high", "medium", "low"]


class PatientSnapshot(BaseModel):
    edad: int
    sexo: str
    nihss: int
    aspects: int
    lvo: str
    inicio_sintomas_texto: str
    tiempo_desde_inicio: str


class EvaluacionResponse(BaseModel):
    id: str
    recommendation: RecommendationCode
    confidence: ConfidenceCode
    reasons: list[str]
    urgent: bool
    patient: PatientSnapshot
    created_at: datetime

    model_config = {"from_attributes": True}


# Alias retrocompatible con imports existentes
PacienteResponse = EvaluacionResponse
