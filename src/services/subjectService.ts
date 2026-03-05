import api from "./api";
import type { Subject, SubjectCreateByEmail } from "../types";

export const subjectService = {
    async getByEmail(email: string): Promise<Subject[]> {
        const { data } = await api.get<Subject[]>("/subjects/by-email", {
            params: { user_email: email },
        });
        return data;
    },

    async getById(id: string): Promise<Subject> {
        const { data } = await api.get<Subject>(`/subjects/${id}`);
        return data;
    },

    // Crear materia usando email (no user_id)
    async createByEmail(payload: SubjectCreateByEmail): Promise<Subject> {
        const { data } = await api.post<Subject>("/subjects/by-email", payload);
        return data;
    },

    async update(id: string, payload: { name?: string; color?: string }): Promise<Subject> {
        const { data } = await api.patch<Subject>(`/subjects/${id}`, payload);
        return data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/subjects/${id}`);
    },
};