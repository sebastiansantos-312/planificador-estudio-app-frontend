import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { taskService } from "../services/taskService";
import { subjectService } from "../services/subjectService";
import { authService } from "../services/authService";
import TaskCard from "../components/TaskCard";
import type { Task, Subject, LoadingState } from "../types";

interface Section {
    key: string;
    label: string;
    tasks: Task[];
    badgeLabel?: string;
    badgeClass?: string;
    emptyMsg: string;
    accent: string;
}

export default function HoyPage() {
    const navigate = useNavigate();
    const session = authService.getSession();

    const [vencidas, setVencidas] = useState<Task[]>([]);
    const [paraHoy, setParaHoy] = useState<Task[]>([]);
    const [proximas, setProximas] = useState<Task[]>([]);
    const [subjects, setSubjects] = useState<Map<string, Subject>>(new Map());
    const [loadState, setLoadState] = useState<LoadingState>("loading");
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        if (!session) { navigate("/auth"); return; }
        load();
    }, []);

    async function load() {
        if (!session) return;
        setLoadState("loading");
        try {
            const [hoy, subs] = await Promise.all([
                taskService.getHoy(session.email),
                subjectService.getByEmail(session.email),
            ]);
            setVencidas(hoy.vencidas ?? []);
            setParaHoy(hoy.para_hoy ?? []);
            setProximas(hoy.proximas ?? []);
            const map = new Map<string, Subject>();
            subs.forEach((s) => map.set(s.id, s));
            setSubjects(map);
            setLoadState("success");
        } catch {
            setLoadState("error");
            setErrorMsg("No se pudo cargar la vista de hoy. Verifica tu conexión.");
        }
    }

    const totalTasks = vencidas.length + paraHoy.length + proximas.length;

    const sections: Section[] = [
        {
            key: "vencidas",
            label: "Vencidas",
            tasks: vencidas,
            badgeLabel: "Vencida",
            badgeClass: "bg-red-500/15 text-red-400 border-red-500/30",
            emptyMsg: "Sin tareas vencidas 🎉",
            accent: "text-red-400 border-red-500/30",
        },
        {
            key: "hoy",
            label: "Para hoy",
            tasks: paraHoy,
            emptyMsg: "Sin tareas para hoy",
            accent: "text-violet-400 border-violet-500/30",
        },
        {
            key: "proximas",
            label: "Próximas",
            tasks: proximas,
            emptyMsg: "Sin tareas próximas",
            accent: "text-slate-400 border-slate-600/40",
        },
    ];

    // ── Loading ───────────────────────────────────────────────────────────────
    if (loadState === "loading") {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4" role="status" aria-live="polite">
                <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-400 text-sm">Cargando tu día...</p>
            </div>
        );
    }

    // ── Error ─────────────────────────────────────────────────────────────────
    if (loadState === "error") {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4" role="alert">
                <span className="text-4xl">⚠️</span>
                <p className="text-slate-300 font-medium">{errorMsg}</p>
                <button
                    onClick={load}
                    className="bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                >
                    Reintentar
                </button>
            </div>
        );
    }

    // ── Empty ─────────────────────────────────────────────────────────────────
    if (totalTasks === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                <span className="text-5xl">🌿</span>
                <p className="text-slate-300 font-semibold text-lg">¡Todo en calma!</p>
                <p className="text-slate-500 text-sm max-w-xs">No tienes actividades registradas. Crea tu primera tarea para empezar a planificar.</p>
                <button
                    onClick={() => navigate("/crear")}
                    className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-semibold px-6 py-3 rounded-xl transition shadow-lg shadow-violet-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                >
                    Crear actividad
                </button>
            </div>
        );
    }

    // ── Success ───────────────────────────────────────────────────────────────
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-white text-2xl font-bold tracking-tight">
                        Hola, {session?.first_name} 👋
                    </h1>
                    <p className="text-slate-400 text-sm mt-0.5">
                        {new Date().toLocaleDateString("es-CO", { weekday: "long", month: "long", day: "numeric" })}
                    </p>
                </div>
                <button
                    onClick={() => navigate("/crear")}
                    className="bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition shadow-lg shadow-violet-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                    aria-label="Crear nueva actividad"
                >
                    + Nueva
                </button>
            </div>

            {/* Summary pill */}
            <div className="flex gap-3 flex-wrap">
                {paraHoy.length > 0 && (
                    <span className="bg-violet-500/15 text-violet-300 border border-violet-500/30 text-xs font-medium px-3 py-1.5 rounded-full">
                        {paraHoy.length} para hoy
                    </span>
                )}
                {vencidas.length > 0 && (
                    <span className="bg-red-500/15 text-red-400 border border-red-500/30 text-xs font-medium px-3 py-1.5 rounded-full">
                        {vencidas.length} vencida{vencidas.length !== 1 ? "s" : ""}
                    </span>
                )}
                {proximas.length > 0 && (
                    <span className="bg-slate-700/60 text-slate-400 text-xs font-medium px-3 py-1.5 rounded-full">
                        {proximas.length} próxima{proximas.length !== 1 ? "s" : ""}
                    </span>
                )}
            </div>

            {/* Sections */}
            {sections.map(({ key, label, tasks, badgeLabel, badgeClass, emptyMsg, accent }) => (
                <section key={key} aria-labelledby={`section-${key}`}>
                    <div className={`flex items-center gap-2 mb-3 pb-2 border-b border-slate-800`}>
                        <h2 id={`section-${key}`} className={`text-sm font-semibold uppercase tracking-widest ${accent.split(" ")[0]}`}>
                            {label}
                        </h2>
                        <span className="text-slate-600 text-xs">{tasks.length}</span>
                    </div>

                    {tasks.length === 0 ? (
                        <p className="text-slate-600 text-sm italic pl-1">{emptyMsg}</p>
                    ) : (
                        <div className="space-y-3">
                            {tasks.map((task) => {
                                const subject = subjects.get(task.subject_id);
                                return (
                                    <TaskCard
                                        key={task.id}
                                        task={task}
                                        subjectName={subject?.name}
                                        subjectColor={subject?.color}
                                        badge={badgeLabel}
                                        badgeClass={badgeClass}
                                    />
                                );
                            })}
                        </div>
                    )}
                </section>
            ))}
        </div>
    );
}
