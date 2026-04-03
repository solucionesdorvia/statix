export type RecommendationCode =
  | "thrombectomy"
  | "borderline"
  | "no_thrombectomy"
  | "inconclusive";

export type ConfidenceCode = "high" | "medium" | "low";

export type PatientSummary = {
  edad: number;
  sexo: string;
  nihss: number;
  aspects: number;
  lvo: string;
  inicio_sintomas_texto: string;
  tiempo_desde_inicio: string;
};

export type AnalysisResultState = {
  recommendation: RecommendationCode;
  confidence: ConfidenceCode;
  reasons: string[];
  urgent: boolean;
  patient: PatientSummary;
  /** ISO 8601 desde el backend */
  created_at?: string;
};
