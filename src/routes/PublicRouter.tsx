import { Navigate, Outlet } from "react-router";
import LoadingSpinner from "../common/components/Loading/LoadingSpinner";
import { useMe } from "../hooks/apis/useMe";
import { useAuthStore } from "../stores/authStore";

/* 로그인 전 화면 (랜딩, 로그인). 이미 로그인했으면 역할별 첫 화면으로 보낸다 */
const PublicRouter = () => {
  const initialized = useAuthStore((state) => state.initialized);
  const session = useAuthStore((state) => state.session);
  const { data: me } = useMe();

  if (!initialized) {
    return <LoadingSpinner fullScreen />;
  }

  if (session && me) {
    return (
      <Navigate to={me.role === "hr_admin" ? "/admin" : "/dashboard"} replace />
    );
  }

  return <Outlet />;
};

export default PublicRouter;
