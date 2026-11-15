import React, { Suspense } from "react";
import { Route, Routes } from "react-router";
import LoadingSpinner from "../common/components/Loading/LoadingSpinner";
const AppLayout = React.lazy(() => import("../layouts/AppLayout"));
const PrivateRoute = React.lazy(() => import("./PrivateRoute"));
const PublicRoute = React.lazy(() => import("./PublicRouter"));
const SessionRoute = React.lazy(() => import("./SessionRoute"));

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
const SetPasswordPage = React.lazy(
  () => import("../pages/SetPasswordPage/SetPasswordPage")
);
const AdminPage = React.lazy(() => import("../pages/AdminPage/AdminPage"));
const AdminLeavesPage = React.lazy(
  () => import("../pages/AdminLeavesPage/AdminLeavesPage")
);
const AdminSettingsPage = React.lazy(
  () => import("../pages/AdminSettingsPage/AdminSettingsPage")
);
const AdminInquiriesPage = React.lazy(
  () => import("../pages/AdminInquiriesPage/AdminInquiriesPage")
);
const InquiriesPage = React.lazy(
  () => import("../pages/InquiriesPage/InquiriesPage")
);
const NotFoundPage = React.lazy(
  () => import("../pages/NotFoundPage/NotFoundPage")
);

const AppRouter = () => {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <Routes>
        {/* 로그인 전 — 사이드바 없음 */}
        <Route element={<PublicRoute />}>
          <Route index element={<LandingPage />} />
          <Route path="login" element={<LoginPage />} />
        </Route>

        {/* 초대 메일 링크로 들어온 직원 — 로그인 세션만 확인 */}
        <Route element={<SessionRoute />}>
          <Route path="set-password" element={<SetPasswordPage />} />
          <Route
            path="change-password"
            element={<SetPasswordPage mode="change" />}
          />
        </Route>

        {/* 직원 로그인 후 — AppLayout*/}
        <Route element={<PrivateRoute permissionLevel="employee" />}>
          <Route element={<AppLayout />}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="attendance" element={<AttendancePage />} />
            <Route path="leaves" element={<LeavesPage />} />
            <Route path="inquiries" element={<InquiriesPage />} />
          </Route>
        </Route>

        {/* 관리자 — hr_admin만 */}
        <Route
          path="admin"
          element={<PrivateRoute permissionLevel="hr_admin" />}
        >
          <Route element={<AppLayout variant="admin" />}>
            <Route index element={<AdminPage />} />
            <Route path="inquiries" element={<AdminInquiriesPage />} />
            <Route path="leaves" element={<AdminLeavesPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRouter;
