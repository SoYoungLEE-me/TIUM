import { Navigate, Outlet } from "react-router";
import LoadingSpinner from "../common/components/Loading/LoadingSpinner";
import { useAuthStore } from "../stores/authStore";

/**
 * 로그인 세션만 있으면 들어올 수 있는 화면 (역할 확인 없음)
 * 초대 메일 링크를 누르면 세션이 생기므로, 초대받은 사람만 비밀번호 설정 화면에 들어온다
 */
const SessionRoute = () => {
  const initialized = useAuthStore((state) => state.initialized);
  const session = useAuthStore((state) => state.session);

  if (!initialized) {
    return <LoadingSpinner fullScreen />;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default SessionRoute;
