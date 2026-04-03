import os

from dotenv import load_dotenv

load_dotenv()


def get_cors_origins() -> list[str]:
    """Orígenes permitidos para CORS: dev local + ALLOWED_ORIGINS (coma-separada, p. ej. URL del frontend en Railway)."""
    defaults = [
        "http://127.0.0.1:5173",
        "http://localhost:5173",
    ]
    raw = os.getenv("ALLOWED_ORIGINS", "").strip()
    if not raw:
        return defaults
    extra = [o.strip() for o in raw.split(",") if o.strip()]
    seen = set(defaults)
    out = list(defaults)
    for o in extra:
        if o not in seen:
            seen.add(o)
            out.append(o)
    return out


class Settings:
    APP_NAME: str = "statix"
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:///./statix.db",
    )


settings = Settings()
