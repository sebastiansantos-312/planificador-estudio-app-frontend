import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import type { LoadingState } from "../types";

type AuthMode = "login" | "register";

export default function AuthPage() {
    const navigate = useNavigate();
    const [mode, setMode] = useState<AuthMode>("login");
    const [state, setState] = useState<LoadingState>("idle");
    const [error, setError] = useState("");

    // Login fields
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Register extra fields
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [birthDate, setBirthDate] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setState("loading");

        try {
            if (mode === "login") {
                const user = await authService.login({ email, password });
                authService.saveSession(user);
                setState("success");
                navigate("/hoy");
            } else {
                await authService.register({
                    first_name: firstName,
                    last_name: lastName,
                    email,
                    password,
                    birth_date: birthDate || undefined,
                });
                // Auto-login after register
                const user = await authService.login({ email, password });
                authService.saveSession(user);
                setState("success");
                navigate("/hoy");
            }
        } catch (err: unknown) {
            setState("error");
            const msg =
                (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
                "Ocurrió un error. Intenta de nuevo.";
            setError(typeof msg === "string" ? msg : JSON.stringify(msg));
        }
    }

    const isLoading = state === "loading";

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            {/* Background decoration */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 mb-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/30">
                            <span className="text-white text-lg">📚</span>
                        </div>
                        <span className="text-white font-bold text-xl tracking-tight">Planificador</span>
                    </div>
                    <p className="text-slate-400 text-sm">Organiza tu estudio. Alcanza tus metas.</p>
                </div>

                {/* Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
                    {/* Tab switcher */}
                    <div className="flex bg-slate-800 rounded-xl p-1 mb-8">
                        {(["login", "register"] as AuthMode[]).map((m) => (
                            <button
                                key={m}
                                onClick={() => { setMode(m); setError(""); }}
                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${mode === m
                                        ? "bg-violet-600 text-white shadow-md shadow-violet-500/20"
                                        : "text-slate-400 hover:text-slate-200"
                                    }`}
                            >
                                {m === "login" ? "Iniciar sesión" : "Registrarse"}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                        {/* Register-only fields */}
                        {mode === "register" && (
                            <>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label htmlFor="firstName" className="block text-sm font-medium text-slate-300 mb-1.5">
                                            Nombre
                                        </label>
                                        <input
                                            id="firstName"
                                            type="text"
                                            required
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            placeholder="Ana"
                                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="lastName" className="block text-sm font-medium text-slate-300 mb-1.5">
                                            Apellido
                                        </label>
                                        <input
                                            id="lastName"
                                            type="text"
                                            required
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            placeholder="García"
                                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="birthDate" className="block text-sm font-medium text-slate-300 mb-1.5">
                                        Fecha de nacimiento <span className="text-slate-500">(opcional)</span>
                                    </label>
                                    <input
                                        id="birthDate"
                                        type="date"
                                        value={birthDate}
                                        onChange={(e) => setBirthDate(e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
                                    />
                                </div>
                            </>
                        )}

                        {/* Common fields */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">
                                Correo electrónico
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="tucorreo@ejemplo.com"
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1.5">
                                Contraseña
                            </label>
                            <input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
                            />
                        </div>

                        {/* Error */}
                        {state === "error" && (
                            <div role="alert" className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3">
                                {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-violet-500/20 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-900 mt-2"
                        >
                            {isLoading
                                ? "Cargando..."
                                : mode === "login"
                                    ? "Ingresar"
                                    : "Crear cuenta"}
                        </button>
                    </form>

                    {/* Demo hint */}
                    {mode === "login" && (
                        <p className="text-center text-slate-500 text-xs mt-5">
                            Demo: <span className="text-slate-400">jose@gmail.com</span> / <span className="text-slate-400">123456</span>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
