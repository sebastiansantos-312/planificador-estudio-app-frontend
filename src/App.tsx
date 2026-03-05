import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { authService } from "./services/authService";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthPage from "./pages/AuthPage";
import HoyPage from "./pages/HoyPage";
import CrearPage from "./pages/CrearPage";
import ActividadPage from "./pages/ActividadPage";
import ProgresoPage from "./pages/ProgresoPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path="/auth" element={<AuthPage />} />

        {/* Protected app shell */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/hoy" replace />} />
          <Route path="hoy" element={<HoyPage />} />
          <Route path="crear" element={<CrearPage />} />
          <Route path="actividad/:id" element={<ActividadPage />} />
          <Route path="progreso" element={<ProgresoPage />} />
        </Route>

        {/* Fallback */}
        <Route
          path="*"
          element={
            authService.isAuthenticated() ? (
              <Navigate to="/hoy" replace />
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}