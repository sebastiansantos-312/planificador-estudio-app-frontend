/**
 * pages/CrearPage.tsx — Formulario para crear una nueva tarea con subtareas.
 *
 * Divide la creación en tres secciones:
 *   Sección 1 — ¿Qué vas a hacer? (título + materia)
 *   Sección 2 — ¿Cuándo y cuánto tiempo? (fecha límite, duración, prioridad)
 *   Sección 3 — Pasos/subtareas (opcional, lista de steps antes de enviar)
 *
 * Flujo de envío:
 *   1. taskService.create() → POST /tasks/ con user_id y subject_id.
 *   2. Por cada subtarea en el draft, subtaskService.create() → POST /subtasks/
 *      con el task_id recién creado. (Las subtareas se crean en serie.)
 *   3. Redirige a /actividad/{task.id}.
 *
 * Las materias se cargan al montar el componente desde:
 *   subjectService.getByEmail() → GET /subjects/by-email?user_email={email}
 *
 * Peticiones al backend:
 *   GET  /subjects/by-email  (al montar)
 *   POST /tasks/             (al enviar formulario)
 *   POST /subtasks/          (una por cada paso agregado)
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { taskService } from "../services/taskService";
import { subtaskService } from "../services/subtaskService";
import { subjectService } from "../services/subjectService";
import { authService } from "../services/authService";
import type { Subject, TaskPriority, SubtaskCreate, LoadingState } from "../types";

/** Estructura interna de una subtarea antes de enviarla al backend. */
interface SubtaskDraft {
    title: string;
    description: string;
    target_date: string;
    estimated_minutes: number;
}

export default function CrearPage() {
    const navigate = useNavigate();
    const session = authService.getSession();

    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [subjectsState, setSubjectsState] = useState<LoadingState>("loading");

    // Campos del formulario de tarea
    const [title, setTitle] = useState("");
    const [subjectId, setSubjectId] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [durationMinutes, setDurationMinutes] = useState(60);
    const [priority, setPriority] = useState<TaskPriority>("media");

    // Subtareas pendientes de crear (draft local)
    const [subtasks, setSubtasks] = useState<SubtaskDraft[]>([]);
    const [showSubtaskForm, setShowSubtaskForm] = useState(false);
    const [newSub, setNewSub] = useState<SubtaskDraft>({
        title: "", description: "", target_date: "", estimated_minutes: 30,
    });

    const [submitState, setSubmitState] = useState<LoadingState>("idle");
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        if (!session) return;
        loadSubjects();
    }, []);

    async function loadSubjects() {
        if (!session) return;
        try {
            const data = await subjectService.getByEmail(session.email);
            setSubjects(data);
            if (data.length > 0) setSubjectId(data[0].id);
            setSubjectsState("success");
        } catch (error) {
            console.error("Cargar materias error:", error);
            setSubjectsState("error");
        }
    }

    /** Agrega una subtarea al draft local (sin llamar al backend todavía). */
    function addSubtask() {
        if (!newSub.title.trim() || !newSub.target_date) return;
        setSubtasks((prev) => [...prev, { ...newSub }]);
        setNewSub({ title: "", description: "", target_date: "", estimated_minutes: 30 });
        setShowSubtaskForm(false);
    }

    /** Elimina una subtarea del draft local por índice. */
    function removeSubtask(i: number) {
        setSubtasks((prev) => prev.filter((_, idx) => idx !== i));
    }

    /**
     * Envía el formulario completo al backend.
     * Paso 1: Crea la tarea con POST /tasks/.
     * Paso 2: Por cada subtarea en el draft, crea con POST /subtasks/.
     */
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!session || !subjectId) return;
        setErrorMsg("");
        setSubmitState("loading");

        try {
            // Crear la tarea principal
            const task = await taskService.create({
                title,
                subject_id: subjectId,
                user_id: session.user_id,
                due_date: dueDate,
                duration_minutes: durationMinutes,
                priority,
                status: "pending",
            });

            // Crear cada subtarea con el task_id recién obtenido
            for (const sub of subtasks) {
                const payload: SubtaskCreate = {
                    task_id: task.id,
                    title: sub.title,
                    description: sub.description || undefined,
                    target_date: sub.target_date,
                    estimated_minutes: sub.estimated_minutes,
                    status: "pending",
                };
                await subtaskService.create(payload);
            }

            setSubmitState("success");
            navigate(`/actividad/${task.id}`);
        } catch (error) {
            console.error("Crear actividad error:", error);
            setSubmitState("error");
            setErrorMsg("No se pudo crear la actividad. Verifica los datos e intenta de nuevo.");
        }
    }

    const isLoading = submitState === "loading";

    const PRIORITY_OPTIONS: { value: TaskPriority; label: string; activeClass: string }[] = [
        { value: "alta", label: "Alta", activeClass: "bg-red-500/20 text-red-400 border-red-500/40 ring-1 ring-red-400" },
        { value: "media", label: "Media", activeClass: "bg-amber-500/20 text-amber-400 border-amber-500/40 ring-1 ring-amber-400" },
        { value: "baja", label: "Baja", activeClass: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 ring-1 ring-emerald-400" },
    ];

    return (
        <div className="space-y-8 pb-10">
            <div>
                <button onClick={() => navigate(-1)}
                    className="text-slate-500 hover:text-slate-300 text-sm mb-4 flex items-center gap-1 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded"
                >
                    ← Volver
                </button>
                <h1 className="text-white text-2xl font-bold tracking-tight">Nueva actividad</h1>
                <p className="text-slate-400 text-sm mt-1">Crea una tarea y opcionalmente divídela en pasos.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                {/* Sección 1: Qué vas a hacer */}
                <fieldset className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                    <legend className="text-slate-300 text-sm font-semibold mb-4 flex items-center gap-2">
                        <span className="bg-violet-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">1</span>
                        ¿Qué vas a hacer?
                    </legend>
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-1.5">Título *</label>
                        <input id="title" type="text" required value={title}
                            onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Entregar informe de laboratorio"
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Materia *</label>
                        {subjectsState === "loading" ? (
                            <div className="h-10 bg-slate-800 rounded-xl animate-pulse" />
                        ) : subjectsState === "error" ? (
                            <p className="text-red-400 text-sm">Error cargando materias.</p>
                        ) : subjects.length === 0 ? (
                            <div className="text-slate-500 text-sm">No se encontraron materias predefinidas.</div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {subjects.map((s) => (
                                    <button key={s.id} type="button" onClick={() => setSubjectId(s.id)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${subjectId === s.id ? "border-transparent text-white shadow-md" : "border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 bg-slate-800"}`}
                                        style={subjectId === s.id ? { backgroundColor: s.color, boxShadow: `0 4px 14px ${s.color}40` } : {}}
                                        aria-pressed={subjectId === s.id}
                                    >
                                        {s.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </fieldset>

                {/* Sección 2: Cuándo y cuánto */}
                <fieldset className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                    <legend className="text-slate-300 text-sm font-semibold mb-4 flex items-center gap-2">
                        <span className="bg-violet-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">2</span>
                        ¿Cuándo y cuánto tiempo?
                    </legend>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="dueDate" className="block text-sm font-medium text-slate-300 mb-1.5">Fecha límite *</label>
                            <input id="dueDate" type="date" required value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
                            />
                        </div>
                        <div>
                            <label htmlFor="duration" className="block text-sm font-medium text-slate-300 mb-1.5">Duración (min) *</label>
                            <input id="duration" type="number" min={5} max={480} required value={durationMinutes}
                                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
                            />
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-300 mb-2">Prioridad *</p>
                        <div className="flex gap-2">
                            {PRIORITY_OPTIONS.map(({ value, label, activeClass }) => (
                                <button key={value} type="button" onClick={() => setPriority(value)}
                                    className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${priority === value ? activeClass : "bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300"}`}
                                    aria-pressed={priority === value}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </fieldset>

                {/* Sección 3: Subtareas opcionales */}
                <fieldset className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                    <legend className="text-slate-300 text-sm font-semibold mb-4 flex items-center gap-2">
                        <span className="bg-slate-700 text-slate-300 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">3</span>
                        Pasos / Subtareas <span className="text-slate-600 font-normal">(opcional)</span>
                    </legend>

                    {/* Lista de subtareas del draft */}
                    {subtasks.length > 0 && (
                        <ul className="space-y-2">
                            {subtasks.map((sub, i) => (
                                <li key={i} className="flex items-center justify-between bg-slate-800 rounded-xl px-4 py-3 text-sm">
                                    <div>
                                        <span className="text-white font-medium">{sub.title}</span>
                                        <span className="text-slate-500 ml-2">{sub.estimated_minutes}min · {sub.target_date}</span>
                                    </div>
                                    <button type="button" onClick={() => removeSubtask(i)}
                                        className="text-slate-600 hover:text-red-400 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 rounded"
                                        aria-label={`Eliminar ${sub.title}`}
                                    >✕</button>
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* Formulario inline para agregar un paso */}
                    {showSubtaskForm ? (
                        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 space-y-3">
                            <div>
                                <label htmlFor="subTitle" className="block text-xs font-medium text-slate-400 mb-1">Título del paso *</label>
                                <input id="subTitle" type="text" value={newSub.title}
                                    onChange={(e) => setNewSub({ ...newSub, title: e.target.value })} placeholder="Ej: Buscar bibliografía"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                                />
                            </div>
                            <div>
                                <label htmlFor="subDesc" className="block text-xs font-medium text-slate-400 mb-1">Descripción (opcional)</label>
                                <input id="subDesc" type="text" value={newSub.description}
                                    onChange={(e) => setNewSub({ ...newSub, description: e.target.value })} placeholder="Descripción breve..."
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label htmlFor="subDate" className="block text-xs font-medium text-slate-400 mb-1">Fecha objetivo *</label>
                                    <input id="subDate" type="date" value={newSub.target_date}
                                        onChange={(e) => setNewSub({ ...newSub, target_date: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="subMinutes" className="block text-xs font-medium text-slate-400 mb-1">Minutos estimados</label>
                                    <input id="subMinutes" type="number" min={5} value={newSub.estimated_minutes}
                                        onChange={(e) => setNewSub({ ...newSub, estimated_minutes: Number(e.target.value) })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 pt-1">
                                <button type="button" onClick={addSubtask} disabled={!newSub.title.trim() || !newSub.target_date}
                                    className="bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-xs font-semibold px-4 py-2 rounded-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                                >Agregar paso</button>
                                <button type="button" onClick={() => setShowSubtaskForm(false)}
                                    className="text-slate-500 hover:text-slate-300 text-xs px-3 py-2 rounded-lg transition"
                                >Cancelar</button>
                            </div>
                        </div>
                    ) : (
                        <button type="button" onClick={() => setShowSubtaskForm(true)}
                            className="w-full border border-dashed border-slate-700 hover:border-violet-500/50 text-slate-500 hover:text-violet-400 text-sm py-3 rounded-xl transition focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                        >+ Agregar paso</button>
                    )}
                </fieldset>

                {submitState === "error" && (
                    <div role="alert" className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3">
                        {errorMsg}
                    </div>
                )}

                {/* Botón de envío — deshabilitado si faltan campos obligatorios */}
                <button type="submit" disabled={isLoading || !title.trim() || !subjectId || !dueDate}
                    className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-violet-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                    {isLoading ? "Creando..." : "Crear actividad"}
                </button>
            </form>
        </div>
    );
}
