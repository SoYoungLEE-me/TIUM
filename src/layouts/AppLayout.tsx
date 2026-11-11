import { useMemo, useState } from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import { Outlet } from "react-router";
import Chatbot from "../common/chatbot/Chatbot";
import Scroll from "../common/scroll/scroll";
import adminMock from "../mocks/admin/admin.json";
import type { AdminLeaveRequest } from "../models/admin/admin";
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

  const adminMenuItems = useMemo(() => {
    const pendingCount = (adminMock.requests as AdminLeaveRequest[]).filter(
      (request) => request.status === "pending"
    ).length;

    return ADMIN_MENU.map((item) =>
      item.path === "/admin" ? { ...item, badge: pendingCount } : item
    );
  }, []);

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
          <Outlet />
        </Scroll>
      </Box>
      <Chatbot />
    </Box>
  );
};

export default AppLayout;
