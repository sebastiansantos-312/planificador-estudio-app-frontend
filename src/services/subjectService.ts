import api from "./api";
import type { Subject, SubjectCreate } from "../types";

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

    async create(payload: SubjectCreate): Promise<Subject> {
        const { data } = await api.post<Subject>("/subjects/", payload);
        return data;
    },

    async update(id: string, payload: Partial<SubjectCreate>): Promise<Subject> {
        const { data } = await api.put<Subject>(`/subjects/${id}`, payload);
        return data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/subjects/${id}`);
    },
};