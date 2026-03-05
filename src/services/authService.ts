import api from "./api";
import type { LoginCredentials, LoginResponse, RegisterPayload, User } from "../types";

export const authService = {
    async login(credentials: LoginCredentials): Promise<LoginResponse> {
        const { data } = await api.post<LoginResponse>("/auth/login", credentials);
        return data;
    },

    async register(payload: RegisterPayload): Promise<User> {
        const { data } = await api.post<User>("/users/", payload);
        return data;
    },

    saveSession(user: LoginResponse) {
        localStorage.setItem("user_id", user.user_id);
        localStorage.setItem("user_email", user.email);
        localStorage.setItem("user_first_name", user.first_name);
        localStorage.setItem("user_last_name", user.last_name);
    },

    getSession(): LoginResponse | null {
        const user_id = localStorage.getItem("user_id");
        const email = localStorage.getItem("user_email");
        const first_name = localStorage.getItem("user_first_name");
        const last_name = localStorage.getItem("user_last_name");
        if (!user_id || !email) return null;
        return { user_id, email, first_name: first_name ?? "", last_name: last_name ?? "" };
    },

    clearSession() {
        ["user_id", "user_email", "user_first_name", "user_last_name"].forEach((k) =>
            localStorage.removeItem(k)
        );
    },

    isAuthenticated(): boolean {
        return !!localStorage.getItem("user_id");
    },
};