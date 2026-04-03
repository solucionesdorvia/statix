import axios from "axios";

function normalizeBaseUrl(raw: string): string {
  return raw.trim().replace(/\/+$/, "");
}

/**
 * Base del API.
 * - Vacío: mismo origen (producción: un solo contenedor sirve Vite build + FastAPI).
 * - Con valor: desarrollo local (p. ej. http://127.0.0.1:8000) o despliegues separados.
 */
const raw = import.meta.env.VITE_API_URL?.trim();
export const apiBaseUrl =
  raw === undefined || raw === "" ? "" : normalizeBaseUrl(raw);

/** Producción con URL apuntando a localhost → build mal configurado. */
export const apiUrlMisconfiguredForProd =
  import.meta.env.PROD &&
  apiBaseUrl !== "" &&
  (apiBaseUrl.includes("127.0.0.1") || apiBaseUrl.includes("localhost"));

export const api = axios.create({
  baseURL: apiBaseUrl,
  headers: { "Content-Type": "application/json" },
});
