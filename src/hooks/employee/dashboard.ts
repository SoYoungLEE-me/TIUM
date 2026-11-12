import { useState } from "react";
import { DASHBOARD_RECENT_REQUEST_COUNT } from "../../configs/employee/dashboard";
import dashboardMock from "../../mocks/employee/dashboard.json";
import type { DashboardData } from "../../models/employee/dashboard";
import { getWorkStatus } from "../../utils/employee/dashboard";

// TODO: Supabase 연결 후 조회 결과로 교체
const initialData = dashboardMock as DashboardData;

export const useEmployeeDashboard = () => {
  const { today_attendance, balance, recent_requests } = initialData;

  // TODO: Supabase 연결 후 attendance_records 저장으로 교체. 지금은 화면에서만 바뀜
  const [checkIn, setCheckIn] = useState(today_attendance?.check_in ?? null);
  const [checkOut, setCheckOut] = useState(today_attendance?.check_out ?? null);

  const checkInNow = () => setCheckIn(new Date().toISOString());
  const checkOutNow = () => setCheckOut(new Date().toISOString());

  const recentRequests = [...recent_requests]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, DASHBOARD_RECENT_REQUEST_COUNT);

  return {
    checkIn,
    checkOut,
    isLate: today_attendance?.status === "late",
    workStatus: getWorkStatus(checkIn, checkOut),
    balance,
    recentRequests,
    checkInNow,
    checkOutNow,
  };
};
