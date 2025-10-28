// src/components/ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];           // optional role-based restriction
  departments?: string[];     // optional department-based restriction
}

export function ProtectedRoute({ children, roles, departments }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Role restriction
  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }

  // Department restriction (optional)
  if (departments && user && !departments.includes(user.department || "")) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
}
