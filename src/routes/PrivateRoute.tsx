import { Navigate, Outlet } from "react-router";
import LoadingSpinner from "../common/components/Loading/LoadingSpinner";
import { useMe } from "../hooks/apis/useMe";
import type { EmployeeRole } from "../models/apis/employees";
import { useAuthStore } from "../stores/authStore";

interface PrivateRouteProps {
  permissionLevel: EmployeeRole;
}

/* 역할별 첫 화면 */
const HOME_BY_ROLE: Record<EmployeeRole, string> = {
  employee: "/dashboard",
  hr_admin: "/admin",
};

const PrivateRoute = ({ permissionLevel }: PrivateRouteProps) => {
  const initialized = useAuthStore((state) => state.initialized);
  const session = useAuthStore((state) => state.session);
  const { data: me, isPending, isError } = useMe();

  // 로그인 세션 확인 전
  if (!initialized) {
    return <LoadingSpinner fullScreen />;
  }

  // 로그인 안 됨
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // 직원 정보(역할) 불러오는 중
  if (isPending) {
    return <LoadingSpinner fullScreen />;
  }

  // 직원 정보가 없으면 다시 로그인
  if (isError || !me) {
    return <Navigate to="/login" replace />;
  }

  // 다른 역할의 페이지로 들어오면 내 첫 화면으로
  if (me.role !== permissionLevel) {
    return <Navigate to={HOME_BY_ROLE[me.role]} replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
