import type { Page } from "./common";
import type { Attendance } from "./attendance";
import type { Employee } from "./employee";
import type { Balance, LeaveRequest } from "./leave";

export type DecisionInput = {
  reason: string;
};

export type GrantInput = {
  employee_id: string;
  year: number;
  days: number;
  reason: string;
  submission_key: string;
};

export type AdminLeaveListItem = {
  request: LeaveRequest;
  employee: Employee;
};

export type AdminLeaveListResponse = {
  data: AdminLeaveListItem[];
  pagination: Page;
};

export type AdminLeaveDetail = {
  request: LeaveRequest;
  employee: Employee;
  balance: Balance;
  attendance_conflicts: Attendance[];
};

export type AdminEmployeeBalanceItem = {
  employee: Employee;
  balance: Balance | null;
};

export type AdminEmployeeBalancesResponse = {
  data: AdminEmployeeBalanceItem[];
  pagination: Page;
};
