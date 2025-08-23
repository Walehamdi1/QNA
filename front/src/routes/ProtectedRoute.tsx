import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../state/AuthContext";
import type { Role } from "../types/dtos";

export default function ProtectedRoute({
  children,
  roles,
}: {
  children: ReactNode;
  roles?: Role[]; // optional role filter
}) {
  const { token, role } = useAuth();
  const loc = useLocation();

  if (!token) {
    return <Navigate to="/auth" state={{ from: loc }} replace />;
  }

  if (roles && roles.length > 0 && (!role || !roles.includes(role))) {
    // user is logged in but not allowed here; send to their dashboard
    const fallback =
      role === "ADMIN"
        ? "/dashboard/admin"
        : role === "FOURNISSEUR"
        ? "/dashboard/fournisseur"
        : role === "CLIENT"
        ? "/dashboard/client"
        : "/dashboard";
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
}
