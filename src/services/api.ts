/**
 * services/api.ts — Instancia base de Axios para todas las peticiones HTTP.
 *
 * Configura la URL base del backend desplegado en Render y el header
 * Content-Type común para todos los endpoints.
 *
 * Todos los servicios (authService, taskService, subjectService, subtaskService)
 * importan esta instancia en lugar de usar axios directamente, de modo que
 * cualquier cambio de URL o header global se aplica automáticamente.
 *
 * Flujo de una petición típica:
 *   Componente → Service → api (Axios) → Backend en Render → Supabase (PostgreSQL)
 *
 * Backend URL: https://planificador-backend-fast.onrender.com
 */

import axios from "axios";

const api = axios.create({
    baseURL: "https://planificador-backend-fast.onrender.com",
    headers: { "Content-Type": "application/json" },
});

export default api;