import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";

import { api } from "../api/client";
import type { AnalysisResultState } from "../types/result";

type FormState = {
  edad: string;
  sexo: "" | "Masculino" | "Femenino";
  inicioSintomas: string;
  nihss: string;
  nivelConciencia: "" | "Alerta" | "Somnoliento" | "Estuporoso" | "Coma";
  aspects: string;
  lvo: "" | "Sí" | "No" | "No determinado";
  estudioTacSimple: boolean;
  estudioCta: boolean;
  estudioPerfusion: boolean;
  estudioAngioRm: boolean;
  recibioTpa: "" | "Sí" | "No";
  presionSistolica: string;
  glucemia: string;
  anticoagulado: boolean;
};

type ErrorKey = keyof FormState | "server";

const initialForm: FormState = {
  edad: "",
  sexo: "",
  inicioSintomas: "",
  nihss: "",
  nivelConciencia: "",
  aspects: "",
  lvo: "",
  estudioTacSimple: false,
  estudioCta: false,
  estudioPerfusion: false,
  estudioAngioRm: false,
  recibioTpa: "",
  presionSistolica: "",
  glucemia: "",
  anticoagulado: false,
};

function parseOptionalInt(raw: string): { ok: true; value: number | undefined } | { ok: false } {
  const t = raw.trim();
  if (t === "") return { ok: true, value: undefined };
  const n = Number.parseInt(t, 10);
  if (Number.isNaN(n)) return { ok: false };
  return { ok: true, value: n };
}

function validate(form: FormState): Partial<Record<ErrorKey, string>> {
  const e: Partial<Record<ErrorKey, string>> = {};

  if (!form.edad.trim()) e.edad = "La edad es obligatoria.";
  else {
    const n = Number.parseInt(form.edad, 10);
    if (Number.isNaN(n) || n < 0 || n > 150) e.edad = "Indique una edad entre 0 y 150.";
  }

  if (!form.sexo) e.sexo = "Seleccione el sexo.";

  if (!form.inicioSintomas.trim()) {
    e.inicioSintomas = "Indique la fecha y hora de inicio de síntomas.";
  }

  if (!form.nihss.trim()) e.nihss = "El NIHSS es obligatorio.";
  else {
    const n = Number.parseInt(form.nihss, 10);
    if (Number.isNaN(n) || n < 0 || n > 42) e.nihss = "El NIHSS debe ser un entero entre 0 y 42.";
  }

  if (!form.nivelConciencia) e.nivelConciencia = "Seleccione el nivel de conciencia.";

  if (!form.aspects.trim()) e.aspects = "ASPECTS es obligatorio.";
  else {
    const n = Number.parseInt(form.aspects, 10);
    if (Number.isNaN(n) || n < 0 || n > 10) e.aspects = "ASPECTS debe ser un entero entre 0 y 10.";
  }

  if (!form.lvo) e.lvo = "Indique si se detectó LVO.";

  if (!form.recibioTpa) e.recibioTpa = "Indique si recibió tPA.";

  const pa = parseOptionalInt(form.presionSistolica);
  if (!pa.ok) e.presionSistolica = "Valor numérico no válido.";
  else if (pa.value !== undefined && (pa.value < 0 || pa.value > 400)) {
    e.presionSistolica = "Valores habituales entre 0 y 400 mmHg.";
  }

  const glu = parseOptionalInt(form.glucemia);
  if (!glu.ok) e.glucemia = "Valor numérico no válido.";
  else if (glu.value !== undefined && (glu.value < 0 || glu.value > 2000)) {
    e.glucemia = "Revise el valor de glucemia.";
  }

  return e;
}

function buildTiposEstudio(form: FormState): string[] {
  const out: string[] = [];
  if (form.estudioTacSimple) out.push("TAC simple");
  if (form.estudioCta) out.push("CTA");
  if (form.estudioPerfusion) out.push("Perfusión");
  if (form.estudioAngioRm) out.push("Angio-RM");
  return out;
}

function inputClass(error?: string) {
  return [
    "mt-1.5 w-full rounded-lg border px-3 py-3 text-base text-slate-900 shadow-sm transition-colors",
    "min-h-[44px] lg:min-h-0 lg:rounded-md lg:py-2 lg:text-sm",
    "focus:border-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-700/20",
    error ? "border-red-400 bg-red-50/50" : "border-slate-300 bg-white",
  ].join(" ");
}

function TooltipIcon({ text }: { text: string }) {
  return (
    <span
      className="ml-1 inline-flex min-h-[44px] min-w-[44px] cursor-help items-center justify-center rounded-full border border-slate-300 bg-slate-50 text-xs font-semibold text-slate-500 lg:min-h-0 lg:min-w-0 lg:h-5 lg:w-5"
      title={text}
      role="img"
      aria-label={text}
    >
      i
    </span>
  );
}

export function PacienteNuevo() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<ErrorKey, string>>>({});
  const [loading, setLoading] = useState(false);

  function clearFieldError(key: ErrorKey) {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  async function onSubmit(ev: FormEvent) {
    ev.preventDefault();
    const v = validate(form);
    setErrors(v);
    if (Object.keys(v).length > 0) return;

    setLoading(true);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.server;
      return next;
    });

    const pa = parseOptionalInt(form.presionSistolica);
    const glu = parseOptionalInt(form.glucemia);

    const payload = {
      edad: Number.parseInt(form.edad, 10),
      sexo: form.sexo,
      inicio_sintomas: form.inicioSintomas,
      nihss: Number.parseInt(form.nihss, 10),
      nivel_conciencia: form.nivelConciencia,
      aspects: Number.parseInt(form.aspects, 10),
      lvo: form.lvo,
      tipos_estudio: buildTiposEstudio(form),
      recibio_tpa: form.recibioTpa,
      presion_sistolica: pa.ok ? pa.value : undefined,
      glucemia: glu.ok ? glu.value : undefined,
      anticoagulado: form.anticoagulado,
    };

    try {
      const { data } = await api.post<AnalysisResultState & { id: string; created_at: string }>(
        "/pacientes",
        payload,
      );
      const state: AnalysisResultState = {
        recommendation: data.recommendation,
        confidence: data.confidence,
        reasons: data.reasons,
        urgent: data.urgent,
        patient: data.patient,
        created_at: data.created_at,
      };
      navigate(`/paciente/${data.id}`, { state });
    } catch (e) {
      let server =
        "No se pudo contactar con la API. Compruebe que el backend esté en marcha.";
      if (isAxiosError(e)) {
        const detail = (e.response?.data as { detail?: string } | undefined)?.detail;
        if (typeof detail === "string") {
          server = detail;
        } else if (e.code === "ERR_NETWORK" || e.message === "Network Error" || !e.response) {
          server =
            "Sin respuesta del API (red o URL incorrecta). Si usás Railway: variable VITE_API_URL en el servicio del frontend = URL del API, luego redeploy del frontend.";
        }
      }
      setErrors((prev) => ({
        ...prev,
        server,
      }));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl pb-8 lg:pb-12">
      <header className="mb-6 border-b border-slate-200 pb-5 lg:mb-8 lg:pb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-sky-800">Statix</p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl lg:text-3xl">
          Evaluación clínica
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 lg:text-sm">
          Complete los campos con la información disponible. Los datos obligatorios están marcados con{" "}
          <span className="text-red-600">*</span>.
        </p>
      </header>

      <form
        onSubmit={onSubmit}
        className="space-y-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:space-y-8 lg:p-8"
        noValidate
      >
        {errors.server && (
          <div
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            role="alert"
          >
            {errors.server}
          </div>
        )}

        {/* Sección 1 */}
        <section className="space-y-4 lg:space-y-5">
          <h2 className="border-b border-slate-100 pb-2 text-base font-semibold text-slate-900">
            1. Datos básicos
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:gap-5">
            <div className="sm:col-span-1">
              <label htmlFor="edad" className="text-sm font-medium text-slate-800">
                Edad <span className="text-red-600">*</span>
              </label>
              <input
                id="edad"
                type="number"
                inputMode="numeric"
                min={0}
                max={150}
                autoComplete="off"
                className={inputClass(errors.edad)}
                value={form.edad}
                onChange={(ev) => {
                  setForm((f) => ({ ...f, edad: ev.target.value }));
                  clearFieldError("edad");
                }}
              />
              {errors.edad && (
                <p className="mt-1.5 text-sm text-red-600" role="alert">
                  {errors.edad}
                </p>
              )}
            </div>
            <div className="sm:col-span-1">
              <label htmlFor="sexo" className="text-sm font-medium text-slate-800">
                Sexo <span className="text-red-600">*</span>
              </label>
              <select
                id="sexo"
                className={inputClass(errors.sexo)}
                value={form.sexo}
                onChange={(ev) => {
                  setForm((f) => ({
                    ...f,
                    sexo: ev.target.value as FormState["sexo"],
                  }));
                  clearFieldError("sexo");
                }}
              >
                <option value="">Seleccionar…</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
              </select>
              {errors.sexo && (
                <p className="mt-1.5 text-sm text-red-600" role="alert">
                  {errors.sexo}
                </p>
              )}
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="inicioSintomas" className="text-sm font-medium text-slate-800">
                Fecha y hora de inicio de síntomas <span className="text-red-600">*</span>
              </label>
              <input
                id="inicioSintomas"
                type="datetime-local"
                className={inputClass(errors.inicioSintomas)}
                value={form.inicioSintomas}
                onChange={(ev) => {
                  setForm((f) => ({ ...f, inicioSintomas: ev.target.value }));
                  clearFieldError("inicioSintomas");
                }}
              />
              {errors.inicioSintomas && (
                <p className="mt-1.5 text-sm text-red-600" role="alert">
                  {errors.inicioSintomas}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Sección 2 */}
        <section className="space-y-4 lg:space-y-5">
          <h2 className="border-b border-slate-100 pb-2 text-base font-semibold text-slate-900">
            2. Escala neurológica
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:gap-5">
            <div>
              <label htmlFor="nihss" className="flex items-center text-sm font-medium text-slate-800">
                NIHSS <span className="text-red-600">*</span>
                <TooltipIcon text="NIHSS: escala de severidad del déficit neurológico en el accidente cerebrovascular (ACV). Rango habitual 0–42." />
              </label>
              <input
                id="nihss"
                type="number"
                inputMode="numeric"
                min={0}
                max={42}
                step={1}
                className={inputClass(errors.nihss)}
                value={form.nihss}
                onChange={(ev) => {
                  setForm((f) => ({ ...f, nihss: ev.target.value }));
                  clearFieldError("nihss");
                }}
              />
              {errors.nihss && (
                <p className="mt-1.5 text-sm text-red-600" role="alert">
                  {errors.nihss}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="nivelConciencia" className="text-sm font-medium text-slate-800">
                Nivel de conciencia <span className="text-red-600">*</span>
              </label>
              <select
                id="nivelConciencia"
                className={inputClass(errors.nivelConciencia)}
                value={form.nivelConciencia}
                onChange={(ev) => {
                  setForm((f) => ({
                    ...f,
                    nivelConciencia: ev.target.value as FormState["nivelConciencia"],
                  }));
                  clearFieldError("nivelConciencia");
                }}
              >
                <option value="">Seleccionar…</option>
                <option value="Alerta">Alerta</option>
                <option value="Somnoliento">Somnoliento</option>
                <option value="Estuporoso">Estuporoso</option>
                <option value="Coma">Coma</option>
              </select>
              {errors.nivelConciencia && (
                <p className="mt-1.5 text-sm text-red-600" role="alert">
                  {errors.nivelConciencia}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Sección 3 */}
        <section className="space-y-4 lg:space-y-5">
          <h2 className="border-b border-slate-100 pb-2 text-base font-semibold text-slate-900">
            3. Imágenes
          </h2>
          <div>
            <label htmlFor="aspects" className="flex items-center text-sm font-medium text-slate-800">
              ASPECTS <span className="text-red-600">*</span>
              <TooltipIcon text="0 = peor pronóstico; 10 = mejor." />
            </label>
            <input
              id="aspects"
              type="number"
              inputMode="numeric"
              min={0}
              max={10}
              step={1}
              className={inputClass(errors.aspects)}
              value={form.aspects}
              onChange={(ev) => {
                setForm((f) => ({ ...f, aspects: ev.target.value }));
                clearFieldError("aspects");
              }}
            />
            {errors.aspects && (
              <p className="mt-1.5 text-sm text-red-600" role="alert">
                {errors.aspects}
              </p>
            )}
          </div>

          <fieldset>
            <legend className="text-sm font-medium text-slate-800">
              ¿Se detectó LVO? <span className="text-red-600">*</span>
            </legend>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-4">
              {(["Sí", "No", "No determinado"] as const).map((opt) => (
                <label
                  key={opt}
                  className="inline-flex min-h-[44px] cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-base text-slate-800 active:bg-slate-100 sm:min-h-0 sm:border-transparent sm:bg-transparent sm:px-0 sm:py-0 sm:text-sm"
                >
                  <input
                    type="radio"
                    name="lvo"
                    value={opt}
                    checked={form.lvo === opt}
                    onChange={() => {
                      setForm((f) => ({ ...f, lvo: opt }));
                      clearFieldError("lvo");
                    }}
                    className="h-5 w-5 shrink-0 border-slate-300 text-sky-800 focus:ring-sky-700 lg:h-4 lg:w-4"
                  />
                  {opt}
                </label>
              ))}
            </div>
            {errors.lvo && (
              <p className="mt-2 text-sm text-red-600" role="alert">
                {errors.lvo}
              </p>
            )}
          </fieldset>

          <fieldset>
            <legend className="text-sm font-medium text-slate-800">Tipo de estudio realizado</legend>
            <p className="mt-1 text-xs text-slate-500">Puede marcar más de una opción.</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 sm:gap-3">
              {(
                [
                  ["estudioTacSimple", "TAC simple"],
                  ["estudioCta", "CTA"],
                  ["estudioPerfusion", "Perfusión"],
                  ["estudioAngioRm", "Angio-RM"],
                ] as const
              ).map(([key, label]) => (
                <label
                  key={key}
                  className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-3 text-base text-slate-800 active:bg-slate-100 sm:min-h-0 sm:py-2.5 sm:text-sm lg:hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    checked={form[key]}
                    onChange={(ev) =>
                      setForm((f) => ({ ...f, [key]: ev.target.checked }))
                    }
                    className="h-5 w-5 shrink-0 rounded border-slate-300 text-sky-800 focus:ring-sky-700 lg:h-4 lg:w-4"
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
        </section>

        {/* Sección 4 */}
        <section className="space-y-4 lg:space-y-5">
          <h2 className="border-b border-slate-100 pb-2 text-base font-semibold text-slate-900">
            4. Contexto clínico
          </h2>

          <fieldset>
            <legend className="text-sm font-medium text-slate-800">
              ¿Recibió tPA? <span className="text-red-600">*</span>
            </legend>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-6">
              {(["Sí", "No"] as const).map((opt) => (
                <label
                  key={opt}
                  className="inline-flex min-h-[44px] cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-base text-slate-800 active:bg-slate-100 sm:min-h-0 sm:border-transparent sm:bg-transparent sm:px-0 sm:py-0 sm:text-sm"
                >
                  <input
                    type="radio"
                    name="recibioTpa"
                    value={opt}
                    checked={form.recibioTpa === opt}
                    onChange={() => {
                      setForm((f) => ({ ...f, recibioTpa: opt }));
                      clearFieldError("recibioTpa");
                    }}
                    className="h-5 w-5 shrink-0 border-slate-300 text-sky-800 focus:ring-sky-700 lg:h-4 lg:w-4"
                  />
                  {opt}
                </label>
              ))}
            </div>
            {errors.recibioTpa && (
              <p className="mt-2 text-sm text-red-600" role="alert">
                {errors.recibioTpa}
              </p>
            )}
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2 lg:gap-5">
            <div>
              <label htmlFor="presionSistolica" className="text-sm font-medium text-slate-800">
                Presión arterial sistólica (mmHg)
              </label>
              <input
                id="presionSistolica"
                type="number"
                inputMode="numeric"
                min={0}
                max={400}
                className={inputClass(errors.presionSistolica)}
                value={form.presionSistolica}
                onChange={(ev) => {
                  setForm((f) => ({ ...f, presionSistolica: ev.target.value }));
                  clearFieldError("presionSistolica");
                }}
              />
              {errors.presionSistolica && (
                <p className="mt-1.5 text-sm text-red-600" role="alert">
                  {errors.presionSistolica}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="glucemia" className="text-sm font-medium text-slate-800">
                Glucemia (mg/dL)
              </label>
              <input
                id="glucemia"
                type="number"
                inputMode="numeric"
                min={0}
                max={2000}
                className={inputClass(errors.glucemia)}
                value={form.glucemia}
                onChange={(ev) => {
                  setForm((f) => ({ ...f, glucemia: ev.target.value }));
                  clearFieldError("glucemia");
                }}
              />
              {errors.glucemia && (
                <p className="mt-1.5 text-sm text-red-600" role="alert">
                  {errors.glucemia}
                </p>
              )}
            </div>
          </div>

          <label className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/80 px-4 py-3 text-base text-slate-800 active:bg-slate-100 sm:min-h-0 sm:items-start sm:py-3 sm:text-sm lg:items-start">
            <input
              type="checkbox"
              checked={form.anticoagulado}
              onChange={(ev) => setForm((f) => ({ ...f, anticoagulado: ev.target.checked }))}
              className="h-5 w-5 shrink-0 rounded border-slate-300 text-sky-800 focus:ring-sky-700 lg:mt-0.5 lg:h-4 lg:w-4"
            />
            <span>Paciente anticoagulado</span>
          </label>
        </section>

        <div className="border-t border-slate-200 pt-6">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-sky-900 px-5 py-3.5 text-base font-semibold text-white shadow-md transition hover:bg-sky-950 active:bg-sky-950 disabled:cursor-not-allowed disabled:opacity-70 lg:min-h-0 lg:w-auto lg:min-w-[200px] lg:rounded-lg lg:py-3 lg:text-sm lg:shadow-sm"
          >
            {loading && (
              <svg
                className="h-5 w-5 animate-spin text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
            {loading ? "Analizando…" : "Analizar"}
          </button>
        </div>
      </form>
    </div>
  );
}
