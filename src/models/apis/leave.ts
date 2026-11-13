import type { LeaveBalance, LeavePreview, ReasonCode } from "../chatbot/chatbot";

export type LeaveRequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled";

export type ApprovalType = "auto" | "manual";

export type Balance = LeaveBalance;

export type LeaveRequest = {
  id: string;
  employee_id: string;
  leave_type_id: string;
  leave_type_name?: string;
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

export type LeaveInput = {
  leave_type_id: string;
  start_date: string;
  end_date: string;
  reason?: string | null;
};

export type SubmitLeaveRequest = {
  confirmation_token: string;
  submission_key: string;
};

export type SubmittedLeave = {
  id: string;
  status: "approved" | "pending";
  approval_type: "auto" | null;
  total_days: number;
  decision_reason: string;
  message: string;
};

export type ValidateLeaveResponse = {
  data: LeavePreview;
};

export type { LeavePreview, ReasonCode };
