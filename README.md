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

## Despliegue en Railway (app + API)

Son **dos servicios distintos** en el mismo repositorio (mismo GitHub):

| Qué querés ver en el navegador | Qué servicio abrir |
|-------------------------------|-------------------|
| **La aplicación** (formularios, Statix UI) | URL del servicio **frontend** |
| **Solo API** (Swagger, JSON) | URL del servicio **backend** |

### 1. Servicio API (backend)

- **Root Directory:** vacío (raíz del repo) — usa el `Dockerfile` de la raíz.
- Opcional: **`FRONTEND_PUBLIC_URL`** = URL `https://…` del servicio frontend. Así en `/` del API ves un botón “Abrir la aplicación web”.

### 2. Servicio frontend (React)

- **Settings → Root Directory:** **`/frontend`**
- Variable obligatoria:

| Variable         | Valor |
|------------------|--------|
| `VITE_API_URL`   | URL **https** del servicio API, ej. `https://tu-api.up.railway.app` (sin `/` al final) |

Tras crear o cambiar `VITE_API_URL`, hacé **Redeploy** del frontend (Vite incorpora esa URL al **build**).

### 3. Resumen

1. Desplegá el **API** y copiá su dominio público.  
2. Creá el servicio **frontend** (`/frontend`), poné `VITE_API_URL` = ese dominio, redeploy.  
3. Abrí en el navegador el dominio del **frontend** para usar la app.  
4. (Opcional) En el API, `FRONTEND_PUBLIC_URL` = dominio del frontend.

El API permite CORS desde cualquier origen por defecto. Opcional: `ALLOWED_ORIGINS` (coma-separada).

En producción conviene `DATABASE_URL` con PostgreSQL en Railway (SQLite en el contenedor se pierde al reiniciar).

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
