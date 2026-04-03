import { Link } from "react-router-dom";

export function Home() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold text-slate-900">Statix</h1>
      <p className="mt-3 text-slate-600">
        Panel para registrar datos clínicos básicos y obtener una recomendación
        orientativa (demo).
      </p>
      <Link
        to="/paciente/nuevo"
        className="mt-8 inline-flex rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
      >
        Registrar paciente
      </Link>
    </div>
  );
}
