"""Reglas de elegibilidad para trombectomía (orden de prioridad: NO → CANDIDATO → BORDERLINE → resto NO)."""

from __future__ import annotations

from typing import Any, Literal

Confidence = Literal["high", "medium", "low"]

MINUTES_6H = 6 * 60
MINUTES_24H = 24 * 60


def evaluate_patient(data: dict[str, Any]) -> dict[str, Any]:
    """
    Args:
        data: nihss, aspects, lvo (bool), onset_minutes (int), age (int),
              received_tpa (bool), opcional: lvo_indeterminate (bool),
              onset_valid (bool): False si no hay tiempo fiable desde inicio.

    Returns:
        recommendation, confidence, reasons, urgent
    """
    if not data.get("onset_valid", True):
        age_i = int(data["age"])
        tpa_i = bool(data["received_tpa"])
        return {
            "recommendation": "inconclusive",
            "confidence": "low",
            "reasons": [
                f"Edad: {age_i} años.",
                "Recibió tPA en esta evolución: sí." if tpa_i else "Recibió tPA en esta evolución: no.",
                "No se pudo interpretar de forma fiable la fecha/hora de inicio de síntomas "
                "(formato inválido o fecha futura).",
                "Corrija el dato antes de confiar en una recomendación automática; valoración clínica manual.",
            ],
            "urgent": False,
        }

    nihss: int = data["nihss"]
    aspects: int = data["aspects"]
    lvo: bool = data["lvo"]
    onset_minutes: int = max(0, int(data["onset_minutes"]))
    age: int = int(data["age"])
    received_tpa: bool = bool(data["received_tpa"])
    lvo_indeterminate: bool = bool(data.get("lvo_indeterminate", False))

    reasons: list[str] = []

    # Contexto fijo en todas las respuestas
    reasons.append(f"Edad: {age} años.")
    reasons.append(
        "Recibió tPA en esta evolución: sí." if received_tpa else "Recibió tPA en esta evolución: no."
    )
    if lvo_indeterminate:
        reasons.append(
            "LVO no determinado por imagen: se interpreta como ausencia de LVO confirmado para criterios estrictos."
        )

    def _confidence(
        base: Confidence,
    ) -> Confidence:
        if lvo_indeterminate and base == "high":
            return "medium"
        if lvo_indeterminate:
            return "low"
        return base

    # --- Prioridad 1: NO CANDIDATO (exclusiones duras) ---
    if aspects < 4:
        reasons.append(f"ASPECTS {aspects} < 4: pronóstico parenquimatoso desfavorable (criterio de exclusión).")
        return {
            "recommendation": "no_thrombectomy",
            "confidence": _confidence("high"),
            "reasons": reasons,
            "urgent": False,
        }

    if nihss < 4:
        reasons.append(
            f"NIHSS {nihss} < 4: déficit neurológico leve respecto al umbral habitual para trombectomía en este esquema."
        )
        return {
            "recommendation": "no_thrombectomy",
            "confidence": _confidence("high"),
            "reasons": reasons,
            "urgent": False,
        }

    if onset_minutes > MINUTES_24H:
        h = onset_minutes // 60
        m = onset_minutes % 60
        reasons.append(
            f"Tiempo desde inicio de síntomas > 24 h (~{h}h {m}m): fuera de ventana para criterio de trombectomía considerado."
        )
        return {
            "recommendation": "no_thrombectomy",
            "confidence": _confidence("high"),
            "reasons": reasons,
            "urgent": False,
        }

    # --- Prioridad 2: CANDIDATO (todos los criterios) ---
    is_candidate = (
        nihss >= 6
        and aspects >= 6
        and lvo is True
        and onset_minutes <= MINUTES_24H
    )

    if is_candidate:
        urgent = onset_minutes < MINUTES_6H
        reasons.append(f"NIHSS {nihss} >= 6.")
        reasons.append(f"ASPECTS {aspects} >= 6.")
        reasons.append("LVO detectado en estudios de imagen.")
        reasons.append(
            f"Tiempo desde inicio <= 24 h ({onset_minutes // 60}h {onset_minutes % 60}m)."
        )
        if urgent:
            reasons.append("Ventana < 6 h desde inicio: situación temporal urgente.")
        return {
            "recommendation": "thrombectomy",
            "confidence": _confidence("high"),
            "reasons": reasons,
            "urgent": urgent,
        }

    # --- Prioridad 3: BORDERLINE (cualquiera de las subreglas) ---
    borderline_flags: list[str] = []

    if 4 <= nihss <= 5:
        borderline_flags.append(f"NIHSS en rango borderline ({nihss}, entre 4 y 5).")

    if 4 <= aspects <= 5:
        borderline_flags.append(f"ASPECTS en rango borderline ({aspects}, entre 4 y 5).")

    if (
        lvo
        and onset_minutes > MINUTES_6H
        and onset_minutes <= MINUTES_24H
    ):
        borderline_flags.append(
            "LVO presente y tiempo entre 6 y 24 h desde inicio (criterio de valoración ampliada)."
        )

    if borderline_flags:
        reasons.extend(borderline_flags)
        return {
            "recommendation": "borderline",
            "confidence": "medium" if not lvo_indeterminate else "low",
            "reasons": reasons,
            "urgent": False,
        }

    # --- Resto: no candidato por no cumplir criterios completos ---
    if not lvo:
        reasons.append("Sin LVO confirmado: no se cumplen criterios de candidato a trombectomía mecánica.")
    if nihss < 6:
        reasons.append(f"NIHSS {nihss} < 6: no alcanza umbral de déficit para candidato en este esquema.")
    if aspects < 6:
        reasons.append(
            f"ASPECTS {aspects} < 6: volumen isquémico estimado no alcanza el umbral >= 6 para candidato."
        )

    return {
        "recommendation": "no_thrombectomy",
        "confidence": "medium",
        "reasons": reasons,
        "urgent": False,
    }
