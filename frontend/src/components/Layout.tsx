import { NavLink, Outlet } from "react-router-dom";
import { apiUrlMisconfiguredForProd, apiBaseUrl } from "../api/client";

const linkClassDesktop = ({ isActive }: { isActive: boolean }) =>
  [
    "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
    isActive
      ? "bg-slate-800 text-white"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  ].join(" ");

const linkClassMobile = ({ isActive }: { isActive: boolean }) =>
  [
    "flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-2 text-xs font-semibold transition-colors",
    "min-h-[52px] min-w-0",
    isActive ? "text-sky-800" : "text-slate-500 active:text-slate-700",
    isActive ? "bg-sky-50" : "hover:bg-slate-50 active:bg-slate-100",
  ].join(" ");

function IconHome({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
      />
    </svg>
  );
}

function IconNewPatient({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

export function Layout() {
  return (
    <div className="flex min-h-screen min-h-[100dvh] flex-col bg-slate-50 lg:flex-row">
      {/* Barra superior solo móvil */}
      <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 px-4 pb-3 pt-safe-top shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-white/90 lg:hidden">
        <div className="flex items-baseline justify-between gap-2">
          <div>
            <span className="text-lg font-semibold tracking-tight text-slate-900">Statix</span>
            <p className="text-xs text-slate-500">Asistencia clínica</p>
          </div>
        </div>
      </header>

      {/* Sidebar escritorio (igual que antes) */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-slate-200 bg-white px-4 py-6 shadow-sm print:hidden lg:flex">
        <div className="mb-8">
          <span className="text-lg font-semibold tracking-tight text-slate-900">Statix</span>
          <p className="mt-1 text-xs text-slate-500">Asistencia clínica</p>
        </div>
        <nav className="flex flex-col gap-1">
          <NavLink to="/" end className={linkClassDesktop}>
            Inicio
          </NavLink>
          <NavLink to="/paciente/nuevo" className={linkClassDesktop}>
            Nuevo paciente
          </NavLink>
        </nav>
      </aside>

      <main className="min-w-0 flex-1 px-4 pb-28 pt-4 lg:px-8 lg:pb-8 lg:pt-8">
        {apiUrlMisconfiguredForProd && (
          <div
            className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-3 py-3 text-sm text-amber-950 lg:mb-6 lg:px-4"
            role="alert"
          >
            <strong className="font-semibold">API no configurada en el build.</strong> El frontend está usando{" "}
            <code className="rounded bg-amber-100 px-1">{apiBaseUrl}</code>. En Railway, en el servicio del{" "}
            <strong>frontend</strong>, agregá la variable{" "}
            <code className="rounded bg-amber-100 px-1">VITE_API_URL</code> con la URL pública del API (https://…) y
            volvé a <strong>desplegar</strong> ese servicio.
          </div>
        )}
        <Outlet />
      </main>

      {/* Navegación inferior móvil */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-slate-200 bg-white/95 px-2 pb-safe-bottom pt-2 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur-md supports-[backdrop-filter]:bg-white/90 print:hidden lg:hidden"
        aria-label="Navegación principal"
      >
        <NavLink to="/" end className={linkClassMobile}>
          <IconHome className="h-6 w-6 shrink-0" />
          <span>Inicio</span>
        </NavLink>
        <NavLink to="/paciente/nuevo" className={linkClassMobile}>
          <IconNewPatient className="h-6 w-6 shrink-0" />
          <span>Nuevo</span>
        </NavLink>
      </nav>
    </div>
  );
}
