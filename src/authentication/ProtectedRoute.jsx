
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="p-6">Checking authentication...</div>;
  }

  if (!user || user.status !== "Active") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
