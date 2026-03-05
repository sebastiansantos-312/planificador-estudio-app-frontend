import { useNavigate } from "react-router-dom";
import type { Task } from "../types";

const PRIORITY_STYLES: Record<string, string> = {
    alta: "bg-red-500/15 text-red-400 border-red-500/30",
    media: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    baja: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
};

const STATUS_STYLES: Record<string, string> = {
    pendiente: "text-slate-400",
    en_progreso: "text-violet-400",
    completada: "text-emerald-400",
};

const STATUS_LABELS: Record<string, string> = {
    pendiente: "Pendiente",
    en_progreso: "En progreso",
    completada: "Completada",
};

interface Props {
    task: Task;
    subjectName?: string;
    subjectColor?: string;
    badge?: string; // e.g. "Vencida"
    badgeClass?: string;
}

export default function TaskCard({ task, subjectName, subjectColor, badge, badgeClass }: Props) {
    const navigate = useNavigate();

    const dueDate = new Date(task.due_date + "T00:00:00");
    const formattedDate = dueDate.toLocaleDateString("es-CO", {
        weekday: "short",
        month: "short",
        day: "numeric",
    });

    const hours = Math.floor(task.duration_minutes / 60);
    const mins = task.duration_minutes % 60;
    const durationLabel = hours > 0 ? `${hours}h ${mins > 0 ? mins + "m" : ""}` : `${mins}m`;

    return (
        <button
            onClick={() => navigate(`/actividad/${task.id}`)}
            className="w-full text-left bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 group"
            aria-label={`Ver actividad: ${task.title}`}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        {subjectColor && subjectName && (
                            <span
                                className="text-xs font-medium px-2 py-0.5 rounded-full"
                                style={{ backgroundColor: subjectColor + "30", color: subjectColor }}
                            >
                                {subjectName}
                            </span>
                        )}
                        {badge && (
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${badgeClass}`}>
                                {badge}
                            </span>
                        )}
                    </div>
                    <p className="text-white font-medium text-sm leading-snug group-hover:text-violet-200 transition-colors truncate">
                        {task.title}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                        <span>📅 {formattedDate}</span>
                        <span>⏱ {durationLabel}</span>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${PRIORITY_STYLES[task.priority]}`}>
                        {task.priority}
                    </span>
                    <span className={`text-xs ${STATUS_STYLES[task.status]}`}>
                        {STATUS_LABELS[task.status]}
                    </span>
                </div>
            </div>
        </button>
    );
}
