import { Navigate, Outlet } from "react-router";

const PublicRouter = () => {
  // TODO: Supabase 연결 후 authStore의 user로 교체
  const user = false;

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default PublicRouter;
