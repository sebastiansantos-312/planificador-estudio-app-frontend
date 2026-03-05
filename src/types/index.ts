// ─── User ───────────────────────────────────────────────────────────────────
export interface User {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    birth_date?: string;
    created_at?: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface LoginResponse {
    user_id: string;
    email: string;
    first_name: string;
    last_name: string;
}

export interface RegisterPayload {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    birth_date?: string;
}

// ─── Subject ─────────────────────────────────────────────────────────────────
export interface Subject {
    id: string;
    name: string;
    color: string;
    user_id: string;
    created_at?: string;
}

export interface SubjectCreate {
    name: string;
    color: string;
    user_id: string;
}

// ─── Task ────────────────────────────────────────────────────────────────────
export type TaskPriority = "alta" | "media" | "baja";
export type TaskStatus = "pendiente" | "en_progreso" | "completada";

export interface Task {
    id: string;
    title: string;
    subject_id: string;
    user_id: string;
    due_date: string;          // ISO date string
    duration_minutes: number;
    priority: TaskPriority;
    status: TaskStatus;
    created_at?: string;
    subject?: Subject;         // joined optionally
}

export interface TaskCreate {
    title: string;
    subject_id: string;
    user_id: string;
    due_date: string;
    duration_minutes: number;
    priority: TaskPriority;
    status?: TaskStatus;
}

export interface TaskUpdate extends Partial<TaskCreate> {
    status?: TaskStatus;
}

// ─── Subtask ─────────────────────────────────────────────────────────────────
export type SubtaskStatus = "pendiente" | "completada";

export interface Subtask {
    id: string;
    task_id: string;
    title: string;
    description?: string;
    target_date: string;       // ISO date string
    estimated_minutes: number;
    status: SubtaskStatus;
    created_at?: string;
}

export interface SubtaskCreate {
    task_id: string;
    title: string;
    description?: string;
    target_date: string;
    estimated_minutes: number;
    status?: SubtaskStatus;
}

export interface SubtaskUpdate extends Partial<SubtaskCreate> {
    status?: SubtaskStatus;
}

// ─── Vista Hoy ───────────────────────────────────────────────────────────────
export interface HoyGroup {
    vencidas: Task[];
    para_hoy: Task[];
    proximas: Task[];
}

// ─── Conflict Check ──────────────────────────────────────────────────────────
export interface ConflictResult {
    conflict: boolean;
    total_minutes: number;
    limit_minutes: number;
    message: string;
}

// ─── UI helpers ──────────────────────────────────────────────────────────────
export type LoadingState = "idle" | "loading" | "success" | "error";