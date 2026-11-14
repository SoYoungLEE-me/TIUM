import { Suspense, useMemo, useState } from "react";
import LoadingSpinner from "../common/components/Loading/LoadingSpinner";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import { Outlet } from "react-router";
import Chatbot from "../common/chatbot/Chatbot";
import Scroll from "../common/scroll/scroll";
import { useAdminLeaves } from "../hooks/apis/useAdminLeaves";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

import { ADMIN_MENU, EMPLOYEE_MENU } from "./components/menus";

interface AppLayoutProps {
  /** 사이드바 메뉴 종류 */
  variant?: "employee" | "admin";
}

const AppLayout = ({ variant = "employee" }: AppLayoutProps) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const pendingLeavesQuery = useAdminLeaves(
    { status: "pending", page_size: 100 },
    { enabled: variant === "admin" },
  );

  const adminMenuItems = useMemo(() => {
    const pendingCount = pendingLeavesQuery.data?.data.length ?? 0;

    return ADMIN_MENU.map((item) =>
      item.path === "/admin" ? { ...item, badge: pendingCount } : item,
    );
  }, [pendingLeavesQuery.data]);

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        bgcolor: "background.default",
      }}
    >
      <Sidebar
        menuItems={variant === "admin" ? adminMenuItems : EMPLOYEE_MENU}
        variant={isDesktop ? "permanent" : "temporary"}
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Navbar
          showMenuButton={!isDesktop}
          onMenuClick={() => setMobileOpen(true)}
        />
        <Scroll
          component="main"
          sx={{ px: { xs: 2, md: 3 }, pb: { xs: 2, md: 3 } }}
        >
          {/* 페이지만 로딩 — 사이드바, 네비바, 챗봇은 그대로 유지 */}
          <Suspense fallback={<LoadingSpinner />}>
            <Outlet />
          </Suspense>
        </Scroll>
      </Box>
      <Chatbot />
    </Box>
  );
};

export default AppLayout;
