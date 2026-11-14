import type { DashboardData } from "../models/apis/dashboard";
import type { LeaveRequest } from "../models/apis/leave";
import { getTodayAttendance } from "./attendance";
import { getLeaveBalance, getMyLeaveRequests } from "./leaves";
import { getMe } from "./me";

export const getDashboard = async (): Promise<DashboardData> => {
  const me = await getMe();
  const [today_attendance, balance, requests] = await Promise.all([
    getTodayAttendance(me.id),
    getLeaveBalance(),
    getMyLeaveRequests({ page: 1, page_size: 5 }),
  ]);

  const recent_requests = requests.map((req: LeaveRequest) => ({
    id: req.id,
    leave_type_id: req.leave_type_id,
    leave_type_name: req.leave_type_name ?? "",
    start_date: req.start_date,
    end_date: req.end_date,
    total_days: req.total_days,
    status: req.status,
    approval_type: req.approval_type,
    decision_reason: req.decision_reason,
    created_at: req.created_at,
  }));

  return {
    today_attendance,
    balance,
    recent_requests,
  };
};
