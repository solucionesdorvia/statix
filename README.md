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

## Repositorio Git

El proyecto ya está versionado con Git (rama `main`). Para subirlo a GitHub:

1. Crear un repositorio vacío en [github.com/new](https://github.com/new) (sin README ni `.gitignore` si ya los tenés localmente).
2. En la carpeta del proyecto:

```powershell
cd c:\Users\54113\Desktop\proyectos\statix
git remote add origin https://github.com/TU_USUARIO/statix.git
git push -u origin main
```

(Sustituí `TU_USUARIO/statix` por tu usuario y nombre de repo. Si usás SSH: `git@github.com:TU_USUARIO/statix.git`.)

**Nota:** Configurá tu identidad global si aún no lo hiciste: `git config --global user.name "Tu nombre"` y `git config --global user.email "tu@email.com"`.
