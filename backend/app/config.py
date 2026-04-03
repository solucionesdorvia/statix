import os

from dotenv import load_dotenv

load_dotenv()


def cors_allow_origins_and_credentials() -> tuple[list[str], bool]:
    """
    CORS para el navegador (frontend en otro dominio que el API).

    Sin ALLOWED_ORIGINS: permite cualquier origen (`*`) y sin credenciales;
    así la app en Railway funciona sin variables extra en el API.

    Con ALLOWED_ORIGINS (coma-separada): solo esos orígenes + localhost para dev.
    """
    defaults = [
        "http://127.0.0.1:5173",
        "http://localhost:5173",
    ]
    raw = os.getenv("ALLOWED_ORIGINS", "").strip()
    if not raw:
        return (["*"], False)
    extra = [o.strip() for o in raw.split(",") if o.strip()]
    seen: set[str] = set()
    out: list[str] = []
    for o in defaults + extra:
        if o not in seen:
            seen.add(o)
            out.append(o)
    return (out, False)


class Settings:
    APP_NAME: str = "statix"
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:///./statix.db",
    )


settings = Settings()
