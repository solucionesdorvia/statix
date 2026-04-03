import os

from dotenv import load_dotenv

load_dotenv()


class Settings:
    APP_NAME: str = "statix"
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:///./statix.db",
    )


settings = Settings()
