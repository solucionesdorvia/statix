from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response

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


@app.get("/")
def root():
    return {
        "name": settings.APP_NAME,
        "message": "API Statix — usá /docs para la documentación interactiva.",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/favicon.ico", include_in_schema=False)
def favicon():
    return Response(status_code=204)


@app.get("/health")
def health():
    return {"status": "ok", "app": settings.APP_NAME}
