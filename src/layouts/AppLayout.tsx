import { Suspense, useEffect, useMemo, useState } from "react";
import LoadingSpinner from "../common/components/Loading/LoadingSpinner";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import { Outlet } from "react-router";
import Chatbot from "../common/chatbot/Chatbot";
import Scroll from "../common/scroll/scroll";
import { useAdminLeaves } from "../hooks/apis/useAdminLeaves";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { subscribeLeaveRequests } from "../apis/adminLeaves";
import { countUnreadInquiries } from "../apis/inquiries";
import { queryKeys } from "../hooks/apis/queryKeys";
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
  const queryClient = useQueryClient();

  const pendingLeavesQuery = useAdminLeaves(
    { status: "pending", page: 1, page_size: 1 },
    { enabled: variant === "admin", refetchInterval: 15_000 },
  );

  useEffect(() => {
    if (variant !== "admin") return;
    return subscribeLeaveRequests(() => {
      void queryClient.invalidateQueries({ queryKey: ["adminLeaves"] });
    });
  }, [variant, queryClient]);

  const inquiryUnreadQuery = useQuery({
    queryKey: queryKeys.inquiryUnread(variant),
    queryFn: () => countUnreadInquiries("hr_admin"),
    enabled: variant === "admin",
    refetchInterval: 30_000,
  });

  const adminMenuItems = useMemo(() => {
    const pendingCount =
      pendingLeavesQuery.data?.pagination.total ??
      pendingLeavesQuery.data?.data.length ??
      0;
    const inquiryCount = inquiryUnreadQuery.data ?? 0;

    return ADMIN_MENU.map((item) => {
      if (item.path === "/admin") {
        return { ...item, badge: pendingCount || undefined };
      }
      if (item.path === "/admin/inquiries") {
        return { ...item, badge: inquiryCount || undefined };
      }
      return item;
    });
  }, [pendingLeavesQuery.data, inquiryUnreadQuery.data]);

  const employeeMenuItems = EMPLOYEE_MENU;

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
        menuItems={variant === "admin" ? adminMenuItems : employeeMenuItems}
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
          variant={variant}
        />
        <Scroll
          component="main"
          sx={{ px: { xs: 2, md: 3 }, pb: { xs: 2, md: 3 } }}
        >
          <Suspense fallback={<LoadingSpinner />}>
            <Outlet />
          </Suspense>
        </Scroll>
      </Box>
      <Chatbot variant={variant} />
    </Box>
  );
};

export default AppLayout;
