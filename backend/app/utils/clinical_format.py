"""Formato legible de fechas/tiempos alineado con la lógica del cliente."""

from __future__ import annotations

from datetime import datetime


def format_inicio_sintomas(iso_str: str) -> str:
    raw = iso_str.strip()
    try:
        if raw.endswith("Z"):
            raw = raw[:-1] + "+00:00"
        onset = datetime.fromisoformat(raw)
    except ValueError:
        return iso_str
    return onset.strftime("%d/%m/%Y %H:%M")


def format_tiempo_desde_inicio_label(minutes: int, onset_valid: bool) -> str:
    if not onset_valid:
        return "No calculable (fecha/hora no válida o futura)"
    if minutes < 0:
        return "—"
    h = minutes // 60
    m = minutes % 60
    if h == 0:
        return f"{m} min"
    return f"{h} h {m} min"
