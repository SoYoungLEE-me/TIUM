import { Navigate, Outlet } from "react-router";
import LoadingSpinner from "../common/components/Loading/LoadingSpinner";
import { useMe } from "../hooks/apis/useMe";
import { useAuthStore } from "../stores/authStore";

type Role = "employee" | "hr_admin";

interface PrivateRouteProps {
  permissionLevel: Role;
}

const PrivateRoute = ({ permissionLevel }: PrivateRouteProps) => {
  const session = useAuthStore((s) => s.session);
  const initialized = useAuthStore((s) => s.initialized);
  const meQuery = useMe();

  if (!initialized || (session && meQuery.isLoading)) {
    return <LoadingSpinner />;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (meQuery.isError || !meQuery.data) {
    return <Navigate to="/login" replace />;
  }

  const role = meQuery.data.role;
  if (role !== permissionLevel) {
    return (
      <Navigate to={role === "hr_admin" ? "/admin" : "/dashboard"} replace />
    );
  }

  return <Outlet />;
};

export default PrivateRoute;
