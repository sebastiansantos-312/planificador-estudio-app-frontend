/**
 * types/index.ts — Definiciones de tipos TypeScript del frontend.
 *
 * Centraliza todas las interfaces usadas por servicios y componentes.
 * Cada tipo refleja exactamente la estructura que espera o devuelve el backend.
 *
 * Organización:
 *   - User:       Autenticación y sesión de usuario.
 *   - Subject:    Materias/asignaturas.
 *   - Task:       Tareas académicas.
 *   - Subtask:    Pasos dentro de una tarea.
 *   - HoyGroup:   Respuesta del endpoint /tasks/hoy/prioridades.
 *   - Conflict:   Resultado del check de sobrecarga diaria (US-07).
 *   - UI helpers: Tipos auxiliares para manejo de estado en componentes.
 */

// ─── User ────────────────────────────────────────────────────────────────────

/** Representación completa de un usuario en el sistema. */
export interface User {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    birth_date?: string;
    created_at?: string;
}

/** Datos enviados a POST /auth/login. */
export interface LoginCredentials {
    email: string;
    password: string;
}

/**
 * Respuesta de POST /auth/login.
 * También es lo que se persiste en localStorage como sesión activa.
 * Claves: user_id, user_email, user_first_name, user_last_name.
 */
export interface LoginResponse {
    user_id: string;
    email: string;
    first_name: string;
    last_name: string;
}

/** Datos enviados a POST /users/ para registrar un nuevo usuario. */
export interface RegisterPayload {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    birth_date?: string;
}

// ─── Subject ─────────────────────────────────────────────────────────────────

/** Materia tal como la devuelve el backend. */
export interface Subject {
    id: string;
    name: string;
    color: string;       // Hex color, ej: "#7c3aed" — usado para identificación visual
    user_id: string;
    created_at?: string;
}

/** Datos para crear materia con UUID (POST /subjects/). */
export interface SubjectCreate {
    name: string;
    color: string;
    user_id: string;
}

/**
 * Datos para crear materia con email (POST /subjects/by-email).
 * El frontend usa este formato porque guarda el email en localStorage.
 * El backend resuelve el UUID del usuario internamente.
 */
export interface SubjectCreateByEmail {
    name: string;
    color: string;
    user_email: string;
}

// ─── Task ────────────────────────────────────────────────────────────────────

/**
 * Prioridades de una tarea — en español, como las maneja el backend.
 * Se visualizan con colores: alta=rojo, media=ámbar, baja=verde.
 */
export type TaskPriority = "alta" | "media" | "baja";

/**
 * Estados de una tarea — en inglés como los usa el backend.
 * Flujo: pending → in_progress → done.
 */
export type TaskStatus = "pending" | "in_progress" | "done";

/** Tarea tal como la devuelve el backend. */
export interface Task {
    id: string;
    title: string;
    subject_id: string;
    user_id: string;
    due_date: string;           // Fecha límite en formato ISO "YYYY-MM-DD"
    duration_minutes: number;   // Tiempo total estimado en minutos
    priority: TaskPriority;
    status: TaskStatus;
    created_at?: string;
}

/** Datos enviados a POST /tasks/ para crear una tarea. */
export interface TaskCreate {
    title: string;
    subject_id: string;
    user_id: string;
    due_date: string;
    duration_minutes: number;
    priority: TaskPriority;
    status?: TaskStatus;        // Default del backend: "pending"
}

/** Campos opcionales para PATCH /tasks/{id}. */
export interface TaskUpdate extends Partial<TaskCreate> {
    status?: TaskStatus;
}

// ─── Subtask ─────────────────────────────────────────────────────────────────

/**
 * Estados de una subtarea.
 * Backend acepta: "pending" | "done".
 */
export type SubtaskStatus = "pending" | "done";

/**
 * Subtarea/paso dentro de una tarea.
 * Es la unidad mínima de planificación diaria que aparece en la vista Hoy.
 */
export interface Subtask {
    id: string;
    task_id: string;            // UUID de la tarea padre — permite navegar a /actividad/{task_id}
    title: string;
    description?: string;
    target_date: string;        // Fecha objetivo en formato ISO "YYYY-MM-DD"
    estimated_minutes: number;  // Tiempo estimado para completar el paso
    status: SubtaskStatus;
    created_at?: string;
}

/** Datos enviados a POST /subtasks/ para crear un paso. */
export interface SubtaskCreate {
    task_id: string;
    title: string;
    description?: string;
    target_date: string;
    estimated_minutes: number;
    status?: SubtaskStatus;     // Default del backend: "pending"
}

/** Campos opcionales para PATCH /subtasks/{id}. */
export interface SubtaskUpdate extends Partial<SubtaskCreate> {
    status?: SubtaskStatus;
}

// ─── Vista Hoy ───────────────────────────────────────────────────────────────

/**
 * Subtarea tal como la devuelve GET /tasks/hoy/prioridades.
 * Incluye task_id para que HoyPage pueda navegar a /actividad/{task_id} al hacer clic.
 */
export interface HoySubtask {
    id: string;
    task_id: string;
    title: string;
    description?: string;
    target_date: string;
    estimated_minutes: number;
    status: string;
    created_at?: string;
}

/**
 * Respuesta completa de GET /tasks/hoy/prioridades.
 * El backend pre-ordena cada grupo: vencidas por fecha ASC,
 * hoy por esfuerzo ASC, próximas por fecha ASC.
 */
export interface HoyGroup {
    date: string;               // Fecha actual del servidor en ISO
    overdue: HoySubtask[];      // target_date < hoy (vencidas)
    for_today: HoySubtask[];    // target_date == hoy
    upcoming: HoySubtask[];     // target_date > hoy (próximas)
}

// ─── Conflict Check ──────────────────────────────────────────────────────────

/**
 * Respuesta de POST /subtasks/{id}/check-conflict.
 * Indica si planificar una subtarea en un día supera el límite de 6h.
 * Se dispara desde ActividadPage al pulsar el botón ⚡ de una subtarea.
 */
export interface ConflictResult {
    has_conflict: boolean;
    current_minutes: number;    // Minutos ya planificados para ese día
    new_total_minutes: number;  // Total si se agrega la subtarea
    limit_minutes: number;      // Límite configurado (default backend: 360 = 6h)
    current_hours: number;
    new_total_hours: number;
    limit_hours: number;
    message: string;            // Mensaje legible para mostrar en la UI
}

// ─── UI helpers ──────────────────────────────────────────────────────────────

/**
 * Estado de carga genérico para componentes.
 * - idle:    Sin petición activa (estado inicial antes del primer fetch).
 * - loading: Petición en curso — mostrar spinner.
 * - success: Petición exitosa — mostrar datos.
 * - error:   Petición fallida — mostrar mensaje de error.
 */
export type LoadingState = "idle" | "loading" | "success" | "error";

/** Mapa de etiquetas en español para los estados de tarea. Usado en UI. */
export const STATUS_LABELS: Record<string, string> = {
    pending: "Pendiente",
    in_progress: "En progreso",
    done: "Completada",
};