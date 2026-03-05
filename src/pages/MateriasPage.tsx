import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { subjectService } from "../services/subjectService";
import { authService } from "../services/authService";
import type { Subject, LoadingState } from "../types";

const COLOR_OPTIONS = [
    "#7c3aed", "#6366f1", "#3b82f6", "#06b6d4",
    "#10b981", "#f59e0b", "#ef4444", "#ec4899",
    "#8b5cf6", "#14b8a6", "#f97316", "#84cc16",
];

export default function MateriasPage() {
    const navigate = useNavigate();
    const session = authService.getSession();

    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loadState, setLoadState] = useState<LoadingState>("loading");

    // Form
    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState("");
    const [color, setColor] = useState(COLOR_OPTIONS[0]);
    const [creating, setCreating] = useState(false);
    const [formError, setFormError] = useState("");

    // Delete
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        if (!session) { navigate("/auth"); return; }
        load();
    }, []);

    async function load() {
        if (!session) return;
        setLoadState("loading");
        try {
            const data = await subjectService.getByEmail(session.email);
            setSubjects(data);
            setLoadState("success");
        } catch {
            setLoadState("error");
        }
    }

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        if (!session || !name.trim()) return;
        setCreating(true);
        setFormError("");
        try {
            const created = await subjectService.createByEmail({
                name: name.trim(),
                color,
                user_email: session.email,
            });
            setSubjects((prev) => [...prev, created]);
            setName("");
            setColor(COLOR_OPTIONS[0]);
            setShowForm(false);
        } catch {
            setFormError("No se pudo crear la materia. Intenta de nuevo.");
        } finally {
            setCreating(false);
        }
    }

    async function handleDelete(id: string, subjectName: string) {
        if (!confirm(`¿Eliminar la materia "${subjectName}"? Esto también eliminará sus tareas.`)) return;
        setDeletingId(id);
        try {
            await subjectService.delete(id);
            setSubjects((prev) => prev.filter((s) => s.id !== id));
        } catch {/* ignore */ }
        finally { setDeletingId(null); }
    }

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-white text-2xl font-bold tracking-tight">Materias</h1>
                    <p className="text-slate-400 text-sm mt-1">Gestiona tus materias y colores</p>
                </div>
                <button
                    onClick={() => { setShowForm(true); setFormError(""); }}
                    className="bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition shadow-lg shadow-violet-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                >
                    + Nueva
                </button>
            </div>

            {/* Create form */}
            {showForm && (
                <form onSubmit={handleCreate} className="bg-slate-900 border border-violet-500/30 rounded-2xl p-5 space-y-4">
                    <h2 className="text-white font-semibold text-sm">Nueva materia</h2>
                    <div>
                        <label htmlFor="subjectName" className="block text-sm font-medium text-slate-300 mb-1.5">
                            Nombre *
                        </label>
                        <input
                            id="subjectName"
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ej: Cálculo diferencial"
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
                            autoFocus
                        />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-300 mb-2">Color</p>
                        <div className="flex flex-wrap gap-2">
                            {COLOR_OPTIONS.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setColor(c)}
                                    className={`w-8 h-8 rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${color === c ? "ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110" : "hover:scale-105"
                                        }`}
                                    style={{ backgroundColor: c }}
                                    aria-label={`Color ${c}`}
                                    aria-pressed={color === c}
                                />
                            ))}
                        </div>
                    </div>
                    {formError && (
                        <p className="text-red-400 text-sm">{formError}</p>
                    )}
                    <div className="flex gap-2">
                        <button
                            type="submit"
                            disabled={creating || !name.trim()}
                            className="bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                        >
                            {creating ? "Creando..." : "Crear materia"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="text-slate-500 hover:text-slate-300 text-sm px-4 py-2.5 rounded-xl transition focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            )}

            {/* Loading */}
            {loadState === "loading" && (
                <div className="flex justify-center py-12" role="status">
                    <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            {/* Empty */}
            {loadState === "success" && subjects.length === 0 && (
                <div className="text-center py-16">
                    <p className="text-5xl mb-4">📚</p>
                    <p className="text-slate-300 font-semibold">Sin materias todavía</p>
                    <p className="text-slate-500 text-sm mt-1">Crea tu primera materia para organizar tus tareas.</p>
                </div>
            )}

            {/* List */}
            {loadState === "success" && subjects.length > 0 && (
                <div className="space-y-3">
                    {subjects.map((s) => (
                        <div key={s.id} className="bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                                <span className="text-white font-medium text-sm">{s.name}</span>
                            </div>
                            <button
                                onClick={() => handleDelete(s.id, s.name)}
                                disabled={deletingId === s.id}
                                className="text-slate-600 hover:text-red-400 text-xs transition focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 rounded disabled:opacity-40"
                                aria-label={`Eliminar materia ${s.name}`}
                            >
                                {deletingId === s.id ? "..." : "🗑"}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
