import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { isAxiosError } from "axios";

import { api } from "../api/client";
import type { AnalysisResultState } from "../types/result";

function IconCheck({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function IconWarning({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
      />
    </svg>
  );
}

function IconX({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
      <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function IconInconclusive({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path strokeLinecap="round" d="M12 8v4M12 16h.01" />
    </svg>
  );
}

function reasonUsesWarning(text: string): boolean {
  const t = text.toLowerCase();
  if (t.startsWith("edad:")) return false;
  if (t.includes("recibió tpa") && t.includes("no")) return true;
  if (t.includes("recibió tpa") && t.includes("sí")) return false;
  return (
    /no candidato|no concluyente|no fiable|exclusión|desfavorable|fuera de ventana|sin lvo|no determinado|no alcanza|no se cumplen|borderline|rango borderline|valoración ampliada|formato inválido|corrija el dato/.test(
      t,
    ) || /<\s*4|<\s*6|>\s*24/.test(t)
  );
}

const confidenceStyles: Record<NonNullable<AnalysisResultState["confidence"]>, string> = {
  high: "border-emerald-300 bg-emerald-50 text-emerald-900",
  medium: "border-amber-300 bg-amber-50 text-amber-900",
  low: "border-slate-300 bg-slate-100 text-slate-800",
};

const confidenceLabel: Record<NonNullable<AnalysisResultState["confidence"]>, string> = {
  high: "Confianza alta",
  medium: "Confianza media",
  low: "Confianza baja",
};

type ApiEval = AnalysisResultState & { id: string; created_at: string };

export function PacienteResultado() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const fromNav = location.state as AnalysisResultState | null;

  const [fetched, setFetched] = useState<AnalysisResultState | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (fromNav?.recommendation && fromNav?.patient) return;
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setFetchError(null);
    api
      .get<ApiEval>(`/pacientes/${id}`)
      .then(({ data }) => {
        if (cancelled) return;
        setFetched({
          recommendation: data.recommendation,
          confidence: data.confidence,
          reasons: data.reasons,
          urgent: data.urgent,
          patient: data.patient,
          created_at: data.created_at,
        });
      })
      .catch((e) => {
        if (cancelled) return;
        if (isAxiosError(e) && (e.code === "ERR_NETWORK" || e.message === "Network Error" || !e.response)) {
          setFetchError(
            "No hay respuesta del API. Compruebe la URL del backend (VITE_API_URL en el build del frontend).",
          );
          return;
        }
        setFetchError("No se encontró esta evaluación o el servidor no respondió.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, fromNav?.recommendation, fromNav?.patient]);

  const state = fromNav?.recommendation && fromNav?.patient ? fromNav : fetched;

  const hasEval =
    state?.recommendation != null &&
    state.reasons != null &&
    state.confidence != null &&
    state.patient != null;

  const rec = state?.recommendation;

  return (
    <div className="mx-auto w-full max-w-3xl print:max-w-none">
      <div className="mb-6 flex flex-col gap-1 print:mb-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Statix</p>
        <p className="font-mono text-xs text-slate-500">
          ID: <span className="text-slate-800">{id}</span>
        </p>
        {state?.created_at && (
          <p className="text-xs text-slate-500">
            Evaluación:{" "}
            {new Date(state.created_at).toLocaleString("es", {
              dateStyle: "short",
              timeStyle: "short",
            })}
          </p>
        )}
      </div>

      {loading && !hasEval && (
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-8 text-slate-600">
          <svg className="h-8 w-8 animate-spin text-sky-800" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Cargando resultado…
        </div>
      )}

      {fetchError && !hasEval && !loading && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
          <p>{fetchError}</p>
          <Link to="/paciente/nuevo" className="mt-3 inline-block font-medium text-amber-900 underline">
            Nuevo paciente
          </Link>
        </div>
      )}

      {!hasEval && !loading && !fetchError && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-slate-600">
            No hay resultado en esta sesión. Envía el formulario desde{" "}
            <Link to="/paciente/nuevo" className="font-medium text-sky-800 underline">
              Nuevo paciente
            </Link>
            .
          </p>
        </div>
      )}

      {hasEval && (
        <>
          {rec === "thrombectomy" && (
            <section
              className="rounded-2xl border-2 border-emerald-600 bg-emerald-600 p-6 text-white shadow-lg sm:p-8 print:border-emerald-700 print:bg-emerald-700"
              aria-labelledby="titulo-rec"
            >
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 sm:h-20 sm:w-20">
                  <IconCheck className="h-10 w-10 text-white sm:h-12 sm:w-12" />
                </div>
                <div>
                  <p id="titulo-rec" className="text-xl font-bold leading-tight sm:text-2xl md:text-3xl">
                    Candidato a trombectomía
                  </p>
                  <p className="mt-2 text-sm text-emerald-100 sm:text-base">
                    Criterios compatibles con tratamiento endovascular según reglas Statix.
                  </p>
                </div>
              </div>
            </section>
          )}

          {rec === "borderline" && (
            <section
              className="rounded-2xl border-2 border-amber-400 bg-amber-50 p-6 text-amber-950 shadow-lg sm:p-8 print:bg-amber-50"
              aria-labelledby="titulo-rec-b"
            >
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-amber-200/80 sm:h-20 sm:w-20">
                  <IconWarning className="h-10 w-10 text-amber-800 sm:h-12 sm:w-12" />
                </div>
                <div>
                  <p id="titulo-rec-b" className="text-xl font-bold leading-tight sm:text-2xl md:text-3xl">
                    Caso borderline — revisión necesaria
                  </p>
                  <p className="mt-2 text-sm text-amber-900/90 sm:text-base">
                    Valoración clínica e imagen adicional recomendables.
                  </p>
                </div>
              </div>
            </section>
          )}

          {rec === "no_thrombectomy" && (
            <section
              className="rounded-2xl border-2 border-red-600 bg-red-600 p-6 text-white shadow-lg sm:p-8 print:bg-red-700"
              aria-labelledby="titulo-rec-n"
            >
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 sm:h-20 sm:w-20">
                  <IconX className="h-10 w-10 text-white sm:h-12 sm:w-12" />
                </div>
                <div>
                  <p id="titulo-rec-n" className="text-xl font-bold leading-tight sm:text-2xl md:text-3xl">
                    No candidato
                  </p>
                  <p className="mt-2 text-sm text-red-100 sm:text-base">
                    No cumple criterios de trombectomía en este modelo de decisión.
                  </p>
                </div>
              </div>
            </section>
          )}

          {rec === "inconclusive" && (
            <section
              className="rounded-2xl border-2 border-slate-500 bg-slate-100 p-6 text-slate-900 shadow-lg sm:p-8 print:bg-slate-50"
              aria-labelledby="titulo-rec-i"
            >
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white sm:h-20 sm:w-20">
                  <IconInconclusive className="h-10 w-10 text-slate-700 sm:h-12 sm:w-12" />
                </div>
                <div>
                  <p id="titulo-rec-i" className="text-xl font-bold leading-tight sm:text-2xl md:text-3xl">
                    No concluyente
                  </p>
                  <p className="mt-2 text-sm text-slate-700 sm:text-base">
                    Falta un dato temporal fiable; no se aplica la regla automática hasta corregirlo.
                  </p>
                </div>
              </div>
            </section>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-3">
            {state!.urgent && rec !== "inconclusive" && (
              <span
                className="inline-flex animate-pulse rounded-lg border-2 border-red-600 bg-red-600 px-3 py-2 text-xs font-bold uppercase tracking-wide text-white shadow-sm sm:text-sm print:animate-none"
                role="status"
              >
                URGENTE — ventana &lt; 6hs
              </span>
            )}
            <span
              className={`inline-flex rounded-lg border px-3 py-2 text-xs font-semibold sm:text-sm ${confidenceStyles[state!.confidence]}`}
            >
              {confidenceLabel[state!.confidence]}
            </span>
          </div>

          <section className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 print:shadow-none">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Fundamentos del análisis</h2>
            <ul className="mt-4 space-y-3">
              {state!.reasons.map((r, i) => {
                const warn = reasonUsesWarning(r);
                return (
                  <li key={i} className="flex gap-3 text-sm leading-relaxed text-slate-800 sm:text-base">
                    <span className="mt-0.5 shrink-0" aria-hidden>
                      {warn ? (
                        <IconWarning className="h-5 w-5 text-amber-600" />
                      ) : (
                        <IconCheck className="h-5 w-5 text-emerald-600" />
                      )}
                    </span>
                    <span>{r}</span>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="mt-6 rounded-xl border border-slate-200 bg-slate-50/80 p-5 sm:p-6 print:bg-white">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Datos ingresados</h2>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
                <dt className="text-xs font-medium text-slate-500">Edad</dt>
                <dd className="mt-1 text-lg font-semibold text-slate-900">{state!.patient.edad} años</dd>
                <dd className="text-xs text-slate-500">{state!.patient.sexo}</dd>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
                <dt className="text-xs font-medium text-slate-500">NIHSS</dt>
                <dd className="mt-1 text-lg font-semibold text-slate-900">{state!.patient.nihss}</dd>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
                <dt className="text-xs font-medium text-slate-500">ASPECTS</dt>
                <dd className="mt-1 text-lg font-semibold text-slate-900">{state!.patient.aspects}</dd>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
                <dt className="text-xs font-medium text-slate-500">LVO</dt>
                <dd className="mt-1 text-lg font-semibold text-slate-900">{state!.patient.lvo}</dd>
              </div>
              <div className="sm:col-span-2 rounded-lg border border-slate-200 bg-white px-4 py-3">
                <dt className="text-xs font-medium text-slate-500">Inicio de síntomas</dt>
                <dd className="mt-1 font-semibold text-slate-900">{state!.patient.inicio_sintomas_texto}</dd>
                <dd className="mt-1 text-sm text-sky-900">
                  Tiempo desde inicio: <strong>{state!.patient.tiempo_desde_inicio}</strong>
                </dd>
              </div>
            </dl>
          </section>

          <div className="mt-8 flex flex-col gap-3 border-t border-slate-200 pt-8 sm:flex-row sm:justify-end print:hidden">
            <button
              type="button"
              onClick={() => window.print()}
              className="order-2 rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 sm:order-1"
            >
              Imprimir
            </button>
            <Link
              to="/paciente/nuevo"
              className="order-1 rounded-lg bg-slate-900 px-5 py-3 text-center text-sm font-semibold text-white shadow-sm hover:bg-slate-800 sm:order-2"
            >
              Nuevo paciente
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
