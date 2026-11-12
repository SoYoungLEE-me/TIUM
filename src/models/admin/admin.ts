export type LeaveRequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled";

export type ApprovalType = "auto" | "manual";

export type LeaveBalanceSnapshot = {
  year: number;
  total_days: number;
  used_days: number;
  remaining_days: number;
  pending_days: number;
  available_days: number;
};

export type AdminLeaveRequest = {
  id: string;
  employee_id: string;
  employee_full_name: string;
  employee_email: string;
  department: string | null;
  leave_type_id: string;
  leave_type_name: string;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string | null;
  status: LeaveRequestStatus;
  approval_type: ApprovalType | null;
  decision_reason: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  balance: LeaveBalanceSnapshot;
};

export type AdminLeaveFilterStatus = LeaveRequestStatus | "all";

export type AdminLeaveFilter = {
  status: AdminLeaveFilterStatus;
  search: string;
  department: string;
};

export type AdminReviewSummary = {
  pending_count: number;
  manual_processed_count: number;
  pending_reserved_days: number;
};

export type AdminStatusCounts = Record<AdminLeaveFilterStatus, number>;

export type ReviewAction = "approve" | "reject";
