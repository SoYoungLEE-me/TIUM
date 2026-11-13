import type { TodayAttendance } from "./attendance";
import type { ApprovalType, Balance, LeaveRequestStatus } from "./leave";

/** employee RecentLeaveRequest 와 동일 shape */
export type RecentLeaveRequest = {
  id: string;
  leave_type_id: string;
  leave_type_name: string;
  start_date: string;
  end_date: string;
  total_days: number;
  status: LeaveRequestStatus;
  approval_type: ApprovalType | null;
  decision_reason: string | null;
  created_at: string;
};

/** @deprecated RecentLeaveRequest 사용 */
export type DashboardRecentLeaveRequest = RecentLeaveRequest;

/**
 * GET /api/dashboard
 * employee DashboardData 와 동일 shape
 * (balance = LeaveBalanceSnapshot / LeaveBalance)
 */
export type DashboardData = {
  today_attendance: TodayAttendance | null;
  balance: Balance;
  recent_requests: RecentLeaveRequest[];
};
