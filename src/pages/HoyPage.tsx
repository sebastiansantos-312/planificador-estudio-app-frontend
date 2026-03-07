/**
 * pages/HoyPage.tsx — Vista diaria priorizada (US-04).
 *
 * Muestra las subtareas pendientes del usuario agrupadas y ordenadas
 * por urgencia. Es la página principal de la app (ruta /hoy).
 *
 * ⚠️ IMPORTANTE: Esta página muestra SUBTAREAS, no tareas directamente.
 *   Si una tarea no tiene subtareas con fecha objetivo, no aparece aquí.
 *   Al hacer clic en un ítem navega a /actividad/{subtarea.task_id}.
 *
 * Flujo de carga:
 *   1. Lee email del usuario desde localStorage (authService.getSession()).
 *   2. taskService.getHoy(email) → GET /tasks/hoy/prioridades?user_email={email}
 *   3. Backend devuelve { date, overdue, for_today, upcoming } con subtareas ya ordenadas.
 *   4. Renderiza tres secciones: Vencidas / Para hoy / Próximas.
 *
 * Peticiones al backend:
 *   GET /tasks/hoy/prioridades?user_email={email}
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { taskService } from "../services/taskService";
import { authService } from "../services/authService";
import type { HoySubtask, LoadingState } from "../types";

/** Configuración de cada sección de la vista diaria. */
interface Section {
    key: string;
    label: string;
    items: HoySubtask[];
    badge?: string;
    badgeClass?: string;
    emptyMsg: string;
    accentColor: string;
}

export default function HoyPage() {
    const navigate = useNavigate();
    const session = authService.getSession();

    const [overdue, setOverdue] = useState<HoySubtask[]>([]);
    const [forToday, setForToday] = useState<HoySubtask[]>([]);
    const [upcoming, setUpcoming] = useState<HoySubtask[]>([]);
    const [loadState, setLoadState] = useState<LoadingState>("loading");
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        if (!session) { navigate("/auth"); return; }
        load();
    }, []);

    /**
     * Carga la vista diaria desde el backend.
     * Llama a GET /tasks/hoy/prioridades y distribuye los grupos en el estado local.
     */
    async function load() {
        if (!session) return;
        setLoadState("loading");
        try {
            const hoy = await taskService.getHoy(session.email);
            setOverdue(hoy.overdue ?? []);
            setForToday(hoy.for_today ?? []);
            setUpcoming(hoy.upcoming ?? []);
            setLoadState("success");
        } catch {
            setLoadState("error");
            setErrorMsg("No se pudo cargar la vista de hoy. Verifica tu conexión.");
        }
    }

    const total = overdue.length + forToday.length + upcoming.length;

    // Configuración de las tres secciones con sus estilos y mensajes vacíos
    const sections: Section[] = [
        {
            key: "vencidas",
            label: "Vencidas",
            items: overdue,
            badge: "Vencida",
            badgeClass: "bg-red-500/15 text-red-400 border border-red-500/30",
            emptyMsg: "Sin subtareas vencidas 🎉",
            accentColor: "text-red-400",
        },
        {
            key: "hoy",
            label: "Para hoy",
            items: forToday,
            emptyMsg: "Sin subtareas para hoy",
            accentColor: "text-violet-400",
        },
        {
            key: "proximas",
            label: "Próximas",
            items: upcoming,
            emptyMsg: "Sin subtareas próximas",
            accentColor: "text-slate-400",
        },
    ];

    // Estado de carga
    if (loadState === "loading") {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4" role="status" aria-live="polite">
                <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-400 text-sm">Cargando tu día...</p>
            </div>
        );
    }

    // Error de red
    if (loadState === "error") {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4" role="alert">
                <span className="text-4xl">⚠️</span>
                <p className="text-slate-300 font-medium">{errorMsg}</p>
                <button onClick={load} className="bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500">
                    Reintentar
                </button>
            </div>
        );
    }

    // Sin subtareas — invita a crear una actividad con pasos
    if (total === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                <span className="text-5xl">🌿</span>
                <p className="text-slate-300 font-semibold text-lg">¡Todo en calma!</p>
                <p className="text-slate-500 text-sm max-w-xs">No tienes subtareas registradas. Crea una actividad con pasos para verlos aquí.</p>
                <button onClick={() => navigate("/crear")}
                    className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-semibold px-6 py-3 rounded-xl transition shadow-lg shadow-violet-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                >
                    Crear actividad
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Encabezado con saludo y fecha */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-white text-2xl font-bold tracking-tight">
                        Hola, {session?.first_name} 👋
                    </h1>
                    <p className="text-slate-400 text-sm mt-0.5">
                        {new Date().toLocaleDateString("es-CO", { weekday: "long", month: "long", day: "numeric" })}
                    </p>
                </div>
                <button onClick={() => navigate("/crear")}
                    className="bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition shadow-lg shadow-violet-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                >
                    + Nueva
                </button>
            </div>

            {/* Pills resumen */}
            <div className="flex gap-3 flex-wrap">
                {forToday.length > 0 && (
                    <span className="bg-violet-500/15 text-violet-300 border border-violet-500/30 text-xs font-medium px-3 py-1.5 rounded-full">
                        {forToday.length} para hoy
                    </span>
                )}
                {overdue.length > 0 && (
                    <span className="bg-red-500/15 text-red-400 border border-red-500/30 text-xs font-medium px-3 py-1.5 rounded-full">
                        {overdue.length} vencida{overdue.length !== 1 ? "s" : ""}
                    </span>
                )}
                {upcoming.length > 0 && (
                    <span className="bg-slate-700/60 text-slate-400 text-xs font-medium px-3 py-1.5 rounded-full">
                        {upcoming.length} próxima{upcoming.length !== 1 ? "s" : ""}
                    </span>
                )}
            </div>

            {/* Tres secciones: Vencidas / Para hoy / Próximas */}
            {sections.map(({ key, label, items, badge, badgeClass, emptyMsg, accentColor }) => (
                <section key={key} aria-labelledby={`section-${key}`}>
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800">
                        <h2 id={`section-${key}`} className={`text-sm font-semibold uppercase tracking-widest ${accentColor}`}>
                            {label}
                        </h2>
                        <span className="text-slate-600 text-xs">{items.length}</span>
                    </div>

                    {items.length === 0 ? (
                        <p className="text-slate-600 text-sm italic pl-1">{emptyMsg}</p>
                    ) : (
                        <div className="space-y-3">
                            {items.map((item) => (
                                // Clic navega a /actividad/{task_id} (NO subtask.id)
                                <button
                                    key={item.id}
                                    onClick={() => navigate(`/actividad/${item.task_id}`)}
                                    className="w-full text-left bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 group"
                                    aria-label={`Ver actividad: ${item.title}`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            {badge && (
                                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full inline-block mb-1.5 ${badgeClass}`}>
                                                    {badge}
                                                </span>
                                            )}
                                            <p className="text-white font-medium text-sm leading-snug group-hover:text-violet-200 transition-colors">
                                                {item.title}
                                            </p>
                                            {item.description && (
                                                <p className="text-slate-500 text-xs mt-0.5 truncate">{item.description}</p>
                                            )}
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-slate-500 text-xs">📅 {item.target_date}</p>
                                            {item.estimated_minutes && (
                                                <p className="text-slate-600 text-xs mt-0.5">⏱ {item.estimated_minutes}min</p>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </section>
            ))}
        </div>
    );
}
