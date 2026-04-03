import axios from "axios";

function normalizeBaseUrl(raw: string | undefined): string {
  const fallback = "http://127.0.0.1:8000";
  if (!raw?.trim()) return fallback;
  return raw.trim().replace(/\/+$/, "");
}

/** URL base del API (en producción debe venir de VITE_API_URL en el build). */
export const apiBaseUrl = normalizeBaseUrl(import.meta.env.VITE_API_URL);

/** Build de producción pero el bundle sigue apuntando a localhost → VITE_API_URL no se definió al construir. */
export const apiUrlMisconfiguredForProd =
  import.meta.env.PROD &&
  (apiBaseUrl.includes("127.0.0.1") || apiBaseUrl.includes("localhost"));

export const api = axios.create({
  baseURL: apiBaseUrl,
  headers: { "Content-Type": "application/json" },
});
