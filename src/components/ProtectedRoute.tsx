import { Navigate } from "react-router-dom";
import { authService } from "../services/authService";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    if (!authService.isAuthenticated()) {
        return <Navigate to="/auth" replace />;
    }
    return <>{children}</>;
}
