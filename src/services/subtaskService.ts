import api from "./api";
import type { Subtask, SubtaskCreate, SubtaskUpdate, ConflictResult } from "../types";

export const subtaskService = {
    async getByTask(taskId: string): Promise<Subtask[]> {
        const { data } = await api.get<Subtask[]>(`/subtasks/by-task/${taskId}`);
        return data;
    },

    async getById(id: string): Promise<Subtask> {
        const { data } = await api.get<Subtask>(`/subtasks/${id}`);
        return data;
    },

    async create(payload: SubtaskCreate): Promise<Subtask> {
        const { data } = await api.post<Subtask>("/subtasks/", payload);
        return data;
    },

    async update(id: string, payload: SubtaskUpdate): Promise<Subtask> {
        const { data } = await api.put<Subtask>(`/subtasks/${id}`, payload);
        return data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/subtasks/${id}`);
    },

    async checkConflict(subtaskId: string): Promise<ConflictResult> {
        const { data } = await api.post<ConflictResult>(
            `/subtasks/${subtaskId}/check-conflict`
        );
        return data;
    },
};