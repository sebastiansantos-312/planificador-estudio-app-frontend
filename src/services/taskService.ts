import api from "./api";
import type { Task, TaskCreate, TaskUpdate, HoyGroup } from "../types";

export const taskService = {
    async getByEmail(email: string): Promise<Task[]> {
        const { data } = await api.get<Task[]>("/tasks/by-email", {
            params: { user_email: email },
        });
        return data;
    },

    async getById(id: string): Promise<Task> {
        const { data } = await api.get<Task>(`/tasks/${id}`);
        return data;
    },

    async getHoy(email: string): Promise<HoyGroup> {
        const { data } = await api.get<HoyGroup>("/tasks/hoy/prioridades", {
            params: { user_email: email },
        });
        return data;
    },

    async create(payload: TaskCreate): Promise<Task> {
        const { data } = await api.post<Task>("/tasks/", payload);
        return data;
    },

    async update(id: string, payload: TaskUpdate): Promise<Task> {
        const { data } = await api.put<Task>(`/tasks/${id}`, payload);
        return data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/tasks/${id}`);
    },
};