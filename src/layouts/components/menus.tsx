import type { ReactNode } from "react";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import BeachAccessRoundedIcon from "@mui/icons-material/BeachAccessRounded";
import FactCheckRoundedIcon from "@mui/icons-material/FactCheckRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";

export interface MenuItem {
  label: string;
  path: string;
  icon: ReactNode;
}

export const EMPLOYEE_MENU: MenuItem[] = [
  { label: "대시보드", path: "/dashboard", icon: <DashboardRoundedIcon /> },
  {
    label: "근태 관리",
    path: "/attendance",
    icon: <CalendarMonthRoundedIcon />,
  },
  { label: "연차 관리", path: "/leaves", icon: <BeachAccessRoundedIcon /> },
];

export const ADMIN_MENU: MenuItem[] = [
  { label: "신청 검토", path: "/admin", icon: <FactCheckRoundedIcon /> },
  { label: "직원 연차", path: "/admin/leaves", icon: <GroupsRoundedIcon /> },
  {
    label: "규정 · AI 설정",
    path: "/admin/settings",
    icon: <TuneRoundedIcon />,
  },
];
