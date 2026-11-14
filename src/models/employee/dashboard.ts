// TODO: 머지 후 공통 모델로 합치기
export type LeaveRequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled";

export type ApprovalType = "auto" | "manual";

export type AttendanceStatus = "present" | "late";

export type LeaveBalanceSnapshot = {
  year: number;
  total_days: number;
  used_days: number;
  remaining_days: number;
  pending_days: number;
  available_days: number;
};

export type TodayAttendance = {
  id: string;
  employee_id: string;
  work_date: string;
  check_in: string | null;
  check_out: string | null;
  status: AttendanceStatus | null;
};

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

export type DashboardData = {
  today_attendance: TodayAttendance | null;
  balance: LeaveBalanceSnapshot;
  recent_requests: RecentLeaveRequest[];
};

export type WorkStatus = "before" | "working" | "done";
