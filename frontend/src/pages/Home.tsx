import { Link } from "react-router-dom";

export function Home() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold leading-tight tracking-tight text-slate-900 lg:text-3xl">
        Statix
      </h1>
      <p className="mt-3 text-base leading-relaxed text-slate-600">
        Panel para registrar datos clínicos básicos y obtener una recomendación orientativa (demo).
      </p>
      <Link
        to="/paciente/nuevo"
        className="mt-8 flex min-h-[48px] w-full items-center justify-center rounded-xl bg-slate-900 px-5 py-3.5 text-base font-semibold text-white shadow-md transition hover:bg-slate-800 active:bg-slate-950 lg:inline-flex lg:w-auto lg:min-h-0 lg:rounded-lg lg:px-4 lg:py-2.5 lg:text-sm lg:font-medium lg:shadow-sm"
      >
        Registrar paciente
      </Link>
    </div>
  );
}
