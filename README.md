# Statix

Aplicación full-stack: **React + Vite + TypeScript** (frontend) y **Python + FastAPI** (backend).

## Requisitos

- Node.js 18+ y npm
- Python 3.10+

## Backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- API: http://127.0.0.1:8000
- Documentación: http://127.0.0.1:8000/docs

Variables opcionales (archivo `.env` en `backend/`):

- `DATABASE_URL` — por defecto usa SQLite (`sqlite:///./statix.db`). Para PostgreSQL: `postgresql+psycopg2://user:pass@localhost:5432/statix`

## Frontend

```powershell
cd frontend
npm install
npm run dev
```

- App: http://127.0.0.1:5173

El cliente asume la API en `http://127.0.0.1:8000` (ver `frontend/.env.example`).

## Estructura

```
statix/
  frontend/     # Vite + React + TS + Tailwind
  backend/      # FastAPI + SQLAlchemy
  README.md
  .gitignore
```
