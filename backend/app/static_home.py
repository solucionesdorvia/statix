"""Página HTML en / para quien abre la URL del API en el navegador (no confundir con la app React)."""

import html
from urllib.parse import urlparse

from app.config import settings


def _safe_public_url(url: str) -> str | None:
    if not url:
        return None
    p = urlparse(url)
    if p.scheme in ("http", "https") and p.netloc:
        return url
    return None


def root_page_html() -> str:
    fe = _safe_public_url(settings.FRONTEND_PUBLIC_URL)
    fe_href = html.escape(fe, quote=True) if fe else ""

    return f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Statix — API</title>
  <style>
    body {{ font-family: system-ui, sans-serif; max-width: 42rem; margin: 2rem auto; padding: 0 1rem; color: #0f172a; line-height: 1.5; }}
    h1 {{ font-size: 1.5rem; margin-bottom: 0.5rem; }}
    .muted {{ color: #64748b; font-size: 0.95rem; margin-bottom: 1.5rem; }}
    .btn {{ display: inline-block; background: #0f172a; color: #fff !important; text-decoration: none; padding: 0.65rem 1.1rem; border-radius: 0.5rem; font-weight: 600; margin: 0.25rem 0.5rem 0.25rem 0; }}
    .btn.secondary {{ background: #e2e8f0; color: #0f172a !important; }}
    ul {{ margin: 1rem 0; padding-left: 1.2rem; }}
    code {{ background: #f1f5f9; padding: 0.15rem 0.35rem; border-radius: 0.25rem; font-size: 0.9em; }}
    .box {{ border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 1rem 1.25rem; margin-top: 1.25rem; background: #fafafa; }}
  </style>
</head>
<body>
  <h1>Statix — API (backend)</h1>
  <p class="muted">Esta URL es el <strong>servidor de la API</strong> (JSON, Swagger). La interfaz con formularios es el <strong>frontend</strong>, otro servicio en Railway.</p>

  {"<p><a class=\"btn\" href=\"" + fe_href + "\">Abrir la aplicación web</a></p>" if fe else "<div class=\"box\"><strong>¿Dónde está la app?</strong><br/>Desplegá un segundo servicio con Root Directory <code>/frontend</code> y abrí <em>su</em> dominio. Opcional: en este servicio (API) definí la variable <code>FRONTEND_PUBLIC_URL</code> con la URL https del frontend para mostrar el botón de arriba.</div>"}

  <p><strong>Herramientas del API</strong></p>
  <ul>
    <li><a href="/docs">Documentación interactiva (Swagger)</a> — lo que veías antes</li>
    <li><a href="/redoc">ReDoc</a></li>
    <li><a href="/openapi.json">OpenAPI JSON</a></li>
    <li><a href="/health">Health check</a></li>
  </ul>

  <div class="box">
    <strong>Para que el frontend hable con este API</strong> en el servicio del frontend (variables):<br/>
    <code>VITE_API_URL</code> = URL de <em>este</em> backend (https, sin barra final). Luego <strong>Redeploy</strong> del frontend.
  </div>
</body>
</html>"""
