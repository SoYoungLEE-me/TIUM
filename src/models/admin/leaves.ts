import type {
  LeaveBalanceSnapshot,
  LeaveRequestStatus,
} from "./admin";

export type EmployeeRole = "employee" | "hr_admin";

export type AdminEmployee = {
  id: string;
  full_name: string;
  email: string;
  department: string | null;
  role: EmployeeRole;
};

export type EmployeeLeaveRequestBrief = {
  id: string;
  leave_type_name: string;
  start_date: string;
  end_date: string;
  total_days: number;
  status: LeaveRequestStatus;
};

export type EmployeeLeaveHistoryItem = {
  id: string;
  category: string;
  change_days: number;
  reason: string;
  processed_at: string;
};

export type EmployeeLeaveRow = {
  employee: AdminEmployee;
  balance: LeaveBalanceSnapshot;
  requests?: EmployeeLeaveRequestBrief[];
  history?: EmployeeLeaveHistoryItem[];
};

export type EmployeeLeaveFilter = {
  year: number;
  search: string;
  department: string;
};

export type GrantLeaveInput = {
  employee_id: string;
  days: number;
  reason: string;
};

export type LeavesPageSummary = {
  employee_count: number;
  total_remaining_days: number;
  total_pending_days: number;
};
