from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, RedirectResponse, Response

from app.config import cors_allow_origins_and_credentials, settings
from app.database import Base, engine
from app.models import ClinicalEvaluation, Paciente  # noqa: F401
from app.routers import pacientes

Base.metadata.create_all(bind=engine)

_origins, _creds = cors_allow_origins_and_credentials()

app = FastAPI(title="Statix", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=_creds,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(pacientes.router)

STATIC_DIR = Path(__file__).resolve().parent.parent / "static"


def _spa_ready() -> bool:
    return (STATIC_DIR / "index.html").is_file()


def _static_file_if_any(relative: str) -> Path | None:
    if not _spa_ready():
        return None
    base = STATIC_DIR.resolve()
    candidate = (STATIC_DIR / relative).resolve()
    try:
        candidate.relative_to(base)
    except ValueError:
        return None
    return candidate if candidate.is_file() else None


@app.get("/")
def root():
    if _spa_ready():
        return FileResponse(STATIC_DIR / "index.html")
    return RedirectResponse(url="/docs")


@app.get("/favicon.ico", include_in_schema=False)
def favicon():
    p = _static_file_if_any("favicon.ico")
    if p is not None:
        return FileResponse(p)
    return Response(status_code=204)


@app.get("/health")
def health():
    return {"status": "ok", "app": settings.APP_NAME}


@app.get("/{full_path:path}")
async def spa_or_static(full_path: str):
    """Archivos estáticos del build de Vite o index.html para rutas de React."""
    if not _spa_ready():
        raise HTTPException(status_code=404, detail="Not Found")
    f = _static_file_if_any(full_path)
    if f is not None:
        return FileResponse(f)
    return FileResponse(STATIC_DIR / "index.html")
