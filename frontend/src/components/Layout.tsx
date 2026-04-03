import { NavLink, Outlet } from "react-router-dom";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
    isActive
      ? "bg-slate-800 text-white"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  ].join(" ");

export function Layout() {
  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r border-slate-200 bg-white px-4 py-6 shadow-sm print:hidden">
        <div className="mb-8">
          <span className="text-lg font-semibold tracking-tight text-slate-900">
            Statix
          </span>
          <p className="mt-1 text-xs text-slate-500">Asistencia clínica</p>
        </div>
        <nav className="flex flex-col gap-1">
          <NavLink to="/" end className={linkClass}>
            Inicio
          </NavLink>
          <NavLink to="/paciente/nuevo" className={linkClass}>
            Nuevo paciente
          </NavLink>
        </nav>
      </aside>
      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}
