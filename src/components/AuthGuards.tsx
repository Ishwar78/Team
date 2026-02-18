import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

/** Requires authenticated super_admin */
export const SuperAdminAuthGuard = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/super/admin/login" replace />;
  }

  if (user.role !== "super_admin") {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

/** Requires authenticated company user */
export const CompanyAdminAuthGuard = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/admin/login" replace />;
  }

  // Block super admin here
  if (user.role === "super_admin") {
    return <Navigate to="/super-admin" replace />;
  }

  // 🔥 FIXED FIELD NAME
  if (!user.company_id) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};
