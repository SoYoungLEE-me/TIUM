import type {
  ApprovalType,
  LeaveBalanceSnapshot,
  LeaveRequestStatus,
} from "./dashboard";

export type LeaveHistoryItem = {
  id: string;
  employee_id: string;
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
};

export type LeavesData = {
  balance: LeaveBalanceSnapshot;
  requests: LeaveHistoryItem[];
};

/** 신청 내역 필터 */
export type LeaveFilter = "all" | "pending" | "auto" | "manual" | "rejected";
