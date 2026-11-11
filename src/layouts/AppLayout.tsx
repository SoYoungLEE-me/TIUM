import { useState } from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import { Outlet } from "react-router";
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

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      <Sidebar
        menuItems={variant === "admin" ? ADMIN_MENU : EMPLOYEE_MENU}
        variant={isDesktop ? "permanent" : "temporary"}
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <Box
        sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}
      >
        <Navbar
          showMenuButton={!isDesktop}
          onMenuClick={() => setMobileOpen(true)}
        />
        <Box
          component="main"
          sx={{ flex: 1, px: { xs: 2, md: 3 }, pb: { xs: 2, md: 3 } }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AppLayout;
