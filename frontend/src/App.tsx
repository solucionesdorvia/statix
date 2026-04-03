import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { PacienteNuevo } from "./pages/PacienteNuevo";
import { PacienteResultado } from "./pages/PacienteResultado";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/paciente/nuevo" element={<PacienteNuevo />} />
        <Route path="/paciente/:id" element={<PacienteResultado />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
