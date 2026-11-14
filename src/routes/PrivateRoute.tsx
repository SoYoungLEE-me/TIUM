import { Navigate, Outlet } from "react-router";

type Role = "employee" | "hr_admin";

interface PrivateRouteProps {
  permissionLevel: Role;
}

// TODO: Supabase 연결 후 실제 인증 상태로 교체
// TODO: 로그인 연동 후 useMe/authStore role로 교체 (Admin 확인용 임시)
const user: { role: Role } | null = { role: "employee" };

const PrivateRoute = ({ permissionLevel }: PrivateRouteProps) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== permissionLevel) {
    return (
      <Navigate
        to={user.role === "hr_admin" ? "/admin" : "/dashboard"}
        replace
      />
    );
  }

  return <Outlet />;
};

export default PrivateRoute;
