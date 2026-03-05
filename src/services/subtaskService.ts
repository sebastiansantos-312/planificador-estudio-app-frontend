import api from "./api";
import type { Subtask, SubtaskCreate, SubtaskUpdate, ConflictResult } from "../types";

export const subtaskService = {
    async getByTask(taskId: string): Promise<Subtask[]> {
        const { data } = await api.get<Subtask[]>(`/subtasks/task/${taskId}`);
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
        const { data } = await api.patch<Subtask>(`/subtasks/${id}`, payload);
        return data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/subtasks/${id}`);
    },

    // check-conflict requiere query params: target_date, estimated_minutes, user_id
    async checkConflict(
        subtaskId: string,
        targetDate: string,
        estimatedMinutes: number,
        userId: string
    ): Promise<ConflictResult> {
        const { data } = await api.post<ConflictResult>(
            `/subtasks/${subtaskId}/check-conflict`,
            null,
            {
                params: {
                    target_date: targetDate,
                    estimated_minutes: estimatedMinutes,
                    user_id: userId,
                },
            }
        );
        return data;
    },
};