/** `datetime-local` → tiempo transcurrido hasta ahora (mismo criterio que el backend en cliente). */
export function formatTiempoDesdeInicio(isoDatetimeLocal: string): string {
  const onset = new Date(isoDatetimeLocal);
  if (Number.isNaN(onset.getTime())) return "—";
  const now = new Date();
  const min = Math.max(0, Math.floor((now.getTime() - onset.getTime()) / 60000));
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} min`;
  return `${h} h ${m} min`;
}

export function formatInicioSintomas(isoDatetimeLocal: string): string {
  const d = new Date(isoDatetimeLocal);
  if (Number.isNaN(d.getTime())) return isoDatetimeLocal;
  return new Intl.DateTimeFormat("es", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(d);
}
