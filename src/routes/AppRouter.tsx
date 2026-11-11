import React, { Suspense } from "react";
import { Route, Routes } from "react-router";
const AppLayout = React.lazy(() => import("../layouts/AppLayout"));
const PrivateRoute = React.lazy(() => import("./PrivateRoute"));
const PublicRoute = React.lazy(() => import("./PublicRouter"));

const LandingPage = React.lazy(
  () => import("../pages/LandingPage/LandingPage")
);
const LoginPage = React.lazy(() => import("../pages/LoginPage/LoginPage"));
const DashboardPage = React.lazy(
  () => import("../pages/DashboardPage/DashboardPage")
);
const AttendancePage = React.lazy(
  () => import("../pages/AttendancePage/AttendancePage")
);
const LeavesPage = React.lazy(() => import("../pages/LeavesPage/LeavesPage"));
const SignupPage = React.lazy(() => import("../pages/SignupPage/SignupPage"));
const AdminPage = React.lazy(() => import("../pages/AdminPage/AdminPage"));
const AdminLeavesPage = React.lazy(
  () => import("../pages/AdminLeavesPage/AdminLeavesPage")
);
const AdminSettingsPage = React.lazy(
  () => import("../pages/AdminSettingsPage/AdminSettingsPage")
);

const AppRouter = () => {
  return (
    <Suspense fallback={null}>
      <Routes>
        {/* 로그인 전 — 사이드바 없음 */}
        <Route element={<PublicRoute />}>
          <Route index element={<LandingPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignupPage />} />
        </Route>

        {/* 직원 로그인 후 — AppLayout*/}
        <Route element={<PrivateRoute permissionLevel="employee" />}>
          <Route element={<AppLayout />}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="attendance" element={<AttendancePage />} />
            <Route path="leaves" element={<LeavesPage />} />
          </Route>
        </Route>

        {/* 관리자 — hr_admin만 */}
        <Route
          path="admin"
          element={<PrivateRoute permissionLevel="hr_admin" />}
        >
          <Route element={<AppLayout variant="admin" />}>
            <Route index element={<AdminPage />} />
            <Route path="leaves" element={<AdminLeavesPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AppRouter;
