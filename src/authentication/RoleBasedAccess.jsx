import { useAuth } from "@/context/AuthContext";


export default function RoleBasedAccess({
  roles = [],
  children,
  fallback = null,
}) {
  const { user } = useAuth();

  if (!user || user.status !== "Active") {
    return fallback;
  }

  if (!roles.includes(user.role)) {
    return fallback;
  }

  return children;
}
