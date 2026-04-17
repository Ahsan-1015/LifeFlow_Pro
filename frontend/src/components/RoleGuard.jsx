import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { hasRoleAccess } from "../utils/roles";

const RoleGuard = ({ allowedRoles, fallback = "/dashboard", children }) => {
  const { user } = useAuth();

  if (!hasRoleAccess(user?.role, allowedRoles)) {
    return <Navigate to={fallback} replace />;
  }

  return children;
};

export default RoleGuard;
