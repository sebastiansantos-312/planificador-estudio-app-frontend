import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { taskService } from "../services/taskService";
import { subtaskService } from "../services/subtaskService";
import { subjectService } from "../services/subjectService";
import { authService } from "../services/authService";
import type { Task, Subtask, Subject, TaskStatus, SubtaskStatus, LoadingState } from "../types";

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
    { value: "pendiente", label: "Pendiente" },
    { value: "en_progreso", label: "En progreso" },
    { value: "completada", label: "Completada" },
];

const PRIORITY_STYLES: Record<string, string> = {
    alta: "bg-red-500/15 text-red-400 border-red-500/30",
    media: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    baja: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
};

export default function ActividadPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const session = authService.getSession();

    const [task, setTask] = useState<Task | null>(null);
    const [subject, setSubject] = useState<Subject | null>(null);
    const [subtasks, setSubtasks] = useState<Subtask[]>([]);
    const [loadState, setLoadState] = useState<LoadingState>("loading");
    const [errorMsg, setErrorMsg] = useState("");

    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [deletingTask, setDeletingTask] = useState(false);
    const [conflictInfo, setConflictInfo] = useState<Record<string, { conflict: boolean; message: string }>>({});

    useEffect(() => {
        if (!session) { navigate("/auth"); return; }
        if (!id) return;
        load(id);
    }, [id]);

    async function load(taskId: string) {
        setLoadState("loading");
        try {
            const t = await taskService.getById(taskId);
            setTask(t);
            const [subs, s] = await Promise.all([
                subtaskService.getByTask(taskId),
                subjectService.getById(t.subject_id),
            ]);
            setSubtasks(subs);
            setSubject(s);
            setLoadState("success");
        } catch {
            setLoadState("error");
            setErrorMsg("No se pudo cargar la actividad.");
        }
    }

    async function updateTaskStatus(status: TaskStatus) {
        if (!task) return;
        setUpdatingStatus(true);
        try {
            const updated = await taskService.update(task.id, { status });
            setTask(updated);
        } catch {
            // silently fail
        } finally {
            setUpdatingStatus(false);
        }
    }

    async function toggleSubtask(sub: Subtask) {
        const newStatus: SubtaskStatus = sub.status === "completada" ? "pendiente" : "completada";
        try {
            const updated = await subtaskService.update(sub.id, { status: newStatus });
            setSubtasks((prev) => prev.map((s) => (s.id === sub.id ? updated : s)));
        } catch {/* ignore */ }
    }

    async function deleteTask() {
        if (!task) return;
        if (!confirm("¿Eliminar esta actividad y todas sus subtareas?")) return;
        setDeletingTask(true);
        try {
            await taskService.delete(task.id);
            navigate("/hoy");
        } catch {
            setDeletingTask(false);
        }
    }

    async function checkConflict(subId: string) {
        try {
            const result = await subtaskService.checkConflict(subId);
            setConflictInfo((prev) => ({ ...prev, [subId]: { conflict: result.conflict, message: result.message } }));
        } catch {/* ignore */ }
    }

    // ── Loading ───────────────────────────────────────────────────────────────
    if (loadState === "loading") {
        return (
            <div className="flex items-center justify-center py-24" role="status" aria-live="polite">
                <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (loadState === "error" || !task) {
        return (
            <div className="flex flex-col items-center py-24 gap-4" role="alert">
                <span className="text-4xl">⚠️</span>
                <p className="text-slate-300">{errorMsg}</p>
                <button onClick={() => navigate("/hoy")} className="bg-violet-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition hover:bg-violet-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500">
                    Volver al inicio
                </button>
            </div>
        );
    }

    const dueDate = new Date(task.due_date + "T00:00:00");
    const formattedDate = dueDate.toLocaleDateString("es-CO", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    const hours = Math.floor(task.duration_minutes / 60);
    const mins = task.duration_minutes % 60;
    const durationLabel = hours > 0 ? `${hours}h ${mins > 0 ? mins + "m" : ""}` : `${mins}m`;
    const completedCount = subtasks.filter((s) => s.status === "completada").length;
    const progress = subtasks.length > 0 ? Math.round((completedCount / subtasks.length) * 100) : null;

    return (
        <div className="space-y-6 pb-10">
            {/* Back */}
            <button
                onClick={() => navigate(-1)}
                className="text-slate-500 hover:text-slate-300 text-sm flex items-center gap-1 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded"
            >
                ← Volver
            </button>

            {/* Header card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        {subject && (
                            <span
                                className="text-xs font-medium px-2 py-0.5 rounded-full inline-block mb-2"
                                style={{ backgroundColor: subject.color + "25", color: subject.color }}
                            >
                                {subject.name}
                            </span>
                        )}
                        <h1 className="text-white text-xl font-bold leading-snug">{task.title}</h1>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0 ${PRIORITY_STYLES[task.priority]}`}>
                        {task.priority}
                    </span>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                    <span className="flex items-center gap-1.5">📅 <span>{formattedDate}</span></span>
                    <span className="flex items-center gap-1.5">⏱ <span>{durationLabel}</span></span>
                </div>

                {/* Progress bar */}
                {progress !== null && (
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-slate-500">
                            <span>Progreso de subtareas</span>
                            <span>{completedCount}/{subtasks.length}</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-500 rounded-full"
                                style={{ width: `${progress}%` }}
                                role="progressbar"
                                aria-valuenow={progress}
                                aria-valuemin={0}
                                aria-valuemax={100}
                            />
                        </div>
                    </div>
                )}

                {/* Status selector */}
                <div>
                    <p className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider">Estado</p>
                    <div className="flex gap-2 flex-wrap">
                        {STATUS_OPTIONS.map(({ value, label }) => (
                            <button
                                key={value}
                                onClick={() => updateTaskStatus(value)}
                                disabled={updatingStatus}
                                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${task.status === value
                                        ? "bg-violet-600 border-violet-500 text-white shadow-md shadow-violet-500/20"
                                        : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600"
                                    } disabled:opacity-50`}
                                aria-pressed={task.status === value}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Subtasks */}
            {subtasks.length > 0 && (
                <section aria-labelledby="subtasks-heading">
                    <h2 id="subtasks-heading" className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-3">
                        Pasos
                    </h2>
                    <div className="space-y-2">
                        {subtasks.map((sub) => {
                            const conflict = conflictInfo[sub.id];
                            return (
                                <div key={sub.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                                    <div className="flex items-start gap-3">
                                        <button
                                            onClick={() => toggleSubtask(sub)}
                                            className={`mt-0.5 w-5 h-5 rounded-md border-2 shrink-0 flex items-center justify-center transition focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${sub.status === "completada"
                                                    ? "bg-emerald-500 border-emerald-500"
                                                    : "border-slate-600 hover:border-violet-400"
                                                }`}
                                            aria-label={`Marcar "${sub.title}" como ${sub.status === "completada" ? "pendiente" : "completada"}`}
                                            aria-checked={sub.status === "completada"}
                                            role="checkbox"
                                        >
                                            {sub.status === "completada" && (
                                                <span className="text-white text-xs font-bold">✓</span>
                                            )}
                                        </button>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium ${sub.status === "completada" ? "line-through text-slate-500" : "text-white"}`}>
                                                {sub.title}
                                            </p>
                                            {sub.description && (
                                                <p className="text-xs text-slate-500 mt-0.5">{sub.description}</p>
                                            )}
                                            <div className="flex gap-3 mt-1.5 text-xs text-slate-600">
                                                <span>📅 {sub.target_date}</span>
                                                <span>⏱ {sub.estimated_minutes}min</span>
                                            </div>
                                            {conflict && (
                                                <div className={`mt-2 text-xs px-2.5 py-1.5 rounded-lg border ${conflict.conflict
                                                        ? "bg-red-500/10 border-red-500/30 text-red-400"
                                                        : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                                    }`}>
                                                    {conflict.message}
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => checkConflict(sub.id)}
                                            className="text-slate-600 hover:text-amber-400 text-xs transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded shrink-0"
                                            title="Verificar sobrecarga"
                                            aria-label="Verificar conflicto de carga"
                                        >
                                            ⚡
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {subtasks.length === 0 && (
                <div className="text-center py-10 text-slate-600">
                    <p className="text-sm">Esta actividad no tiene subtareas.</p>
                </div>
            )}

            {/* Delete */}
            <div className="pt-4 border-t border-slate-800">
                <button
                    onClick={deleteTask}
                    disabled={deletingTask}
                    className="w-full text-red-500/70 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 text-sm font-medium py-3 rounded-xl transition focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:opacity-40"
                >
                    {deletingTask ? "Eliminando..." : "🗑 Eliminar actividad"}
                </button>
            </div>
        </div>
    );
}
