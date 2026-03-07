/**
 * services/authService.ts — Servicio de autenticación y gestión de sesión.
 *
 * Maneja el login, registro y persistencia de la sesión del usuario.
 * La sesión se guarda en localStorage (Sprint 1, sin JWT).
 *
 * Endpoints que consume:
 *   POST /auth/login  → Verifica credenciales, devuelve datos de sesión.
 *   POST /users/      → Registra un nuevo usuario.
 *
 * Claves de localStorage:
 *   user_id         → UUID del usuario autenticado
 *   user_email      → Email (usado por taskService, subjectService como identificador)
 *   user_first_name → Nombre para mostrar en Layout y HoyPage
 *   user_last_name  → Apellido
 *
 * Usado en: AuthPage (login/registro), Layout (logout, nombre), ProtectedRoute (verificar sesión),
 *           todas las páginas (getSession para obtener email/user_id en peticiones al backend).
 */

import api from "./api";
import type { LoginCredentials, LoginResponse, RegisterPayload, User } from "../types";

export const authService = {
    /**
     * Inicia sesión con email y contraseña.
     * Llama a POST /auth/login con las credenciales.
     *
     * @param credentials - Email y contraseña del usuario.
     * @returns LoginResponse con user_id, email, first_name, last_name.
     * @throws AxiosError 401 si las credenciales son inválidas.
     */
    async login(credentials: LoginCredentials): Promise<LoginResponse> {
        const { data } = await api.post<LoginResponse>("/auth/login", credentials);
        return data;
    },

    /**
     * Registra un nuevo usuario en el sistema.
     * Llama a POST /users/ con los datos del formulario de registro.
     * Tras el registro, AuthPage hace auto-login llamando a login().
     *
     * @param payload - Datos del nuevo usuario (nombre, email, contraseña, fecha nacimiento).
     * @returns User creado (sin contraseña).
     */
    async register(payload: RegisterPayload): Promise<User> {
        const { data } = await api.post<User>("/users/", payload);
        return data;
    },

    /**
     * Persiste la sesión del usuario en localStorage.
     * Se llama justo después de un login o registro exitoso.
     *
     * @param user - Datos de sesión devueltos por el backend.
     */
    saveSession(user: LoginResponse) {
        localStorage.setItem("user_id", user.user_id);
        localStorage.setItem("user_email", user.email);
        localStorage.setItem("user_first_name", user.first_name);
        localStorage.setItem("user_last_name", user.last_name);
    },

    /**
     * Lee la sesión actual desde localStorage.
     * Usado en todos los componentes que necesitan el email o user_id
     * para hacer peticiones al backend.
     *
     * @returns LoginResponse con los datos de sesión, o null si no hay sesión.
     */
    getSession(): LoginResponse | null {
        const user_id = localStorage.getItem("user_id");
        const email = localStorage.getItem("user_email");
        const first_name = localStorage.getItem("user_first_name");
        const last_name = localStorage.getItem("user_last_name");
        if (!user_id || !email) return null;
        return { user_id, email, first_name: first_name ?? "", last_name: last_name ?? "" };
    },

    /**
     * Elimina todos los datos de sesión del localStorage (logout).
     * Llamado por el botón "Salir" en Layout, que luego redirige a /auth.
     */
    clearSession() {
        ["user_id", "user_email", "user_first_name", "user_last_name"].forEach((k) =>
            localStorage.removeItem(k)
        );
    },

    /**
     * Verifica si hay una sesión activa.
     * Usado por ProtectedRoute para decidir si redirigir a /auth.
     *
     * @returns true si hay user_id en localStorage, false si no.
     */
    isAuthenticated(): boolean {
        return !!localStorage.getItem("user_id");
    },
};