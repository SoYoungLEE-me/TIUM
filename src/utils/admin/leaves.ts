import type { LeaveBalanceSnapshot } from "../../models/admin/admin";
import type {
  EmployeeLeaveFilter,
  EmployeeLeaveRow,
  LeavesPageSummary,
} from "../../models/admin/leaves";

export const calcRemainingDays = (totalDays: number, usedDays: number) =>
  Number((totalDays - usedDays).toFixed(2));

export const calcAvailableDays = (remainingDays: number, pendingDays: number) =>
  Number((remainingDays - pendingDays).toFixed(2));

export const formatLeaveDays = (days: number) => days.toFixed(1);

export const buildLeaveBalanceSnapshot = (
  year: number,
  totalDays: number,
  usedDays: number,
  pendingDays: number
): LeaveBalanceSnapshot => {
  const remaining_days = calcRemainingDays(totalDays, usedDays);
  return {
    year,
    total_days: totalDays,
    used_days: usedDays,
    remaining_days,
    pending_days: pendingDays,
    available_days: calcAvailableDays(remaining_days, pendingDays),
  };
};

/** 직원 연차 필터용 — hr_admin(HR)은 옵션에서 제외 (신청 검토 드롭다운과 동일 UX) */
export const getEmployeeDepartments = (rows: EmployeeLeaveRow[]) => {
  const set = new Set<string>();
  rows.forEach((row) => {
    if (row.employee.role === "hr_admin") return;
    if (row.employee.department) set.add(row.employee.department);
  });
  return Array.from(set).sort((a, b) => a.localeCompare(b, "ko"));
};

export const filterEmployeeLeaveRows = (
  rows: EmployeeLeaveRow[],
  filter: EmployeeLeaveFilter
) => {
  const keyword = filter.search.trim().toLowerCase();

  return rows.filter((row) => {
    if (row.balance.year !== filter.year) return false;
    if (
      filter.department &&
      filter.department !== "all" &&
      row.employee.department !== filter.department
    ) {
      return false;
    }
    if (!keyword) return true;

    return (
      row.employee.full_name.toLowerCase().includes(keyword) ||
      row.employee.email.toLowerCase().includes(keyword) ||
      (row.employee.department ?? "").toLowerCase().includes(keyword)
    );
  });
};

export const buildLeavesPageSummary = (
  rows: EmployeeLeaveRow[]
): LeavesPageSummary => {
  const totals = rows.reduce(
    (acc, row) => {
      acc.total_remaining_days += row.balance.remaining_days;
      acc.total_pending_days += row.balance.pending_days;
      return acc;
    },
    { total_remaining_days: 0, total_pending_days: 0 }
  );

  return {
    employee_count: rows.length,
    total_remaining_days: Number(totals.total_remaining_days.toFixed(1)),
    total_pending_days: Number(totals.total_pending_days.toFixed(1)),
  };
};

export const applyGrantDays = (
  balance: LeaveBalanceSnapshot,
  days: number
): LeaveBalanceSnapshot =>
  buildLeaveBalanceSnapshot(
    balance.year,
    Number((balance.total_days + days).toFixed(2)),
    balance.used_days,
    balance.pending_days
  );

export const applyApproveDeduction = (
  balance: LeaveBalanceSnapshot,
  days: number
): LeaveBalanceSnapshot => {
  const nextUsed = Number((balance.used_days + days).toFixed(2));
  const nextPending = Number(
    Math.max(0, balance.pending_days - days).toFixed(2)
  );
  return buildLeaveBalanceSnapshot(
    balance.year,
    balance.total_days,
    nextUsed,
    nextPending
  );
};

export const applyRejectRelease = (
  balance: LeaveBalanceSnapshot,
  days: number
): LeaveBalanceSnapshot => {
  const nextPending = Number(
    Math.max(0, balance.pending_days - days).toFixed(2)
  );
  return buildLeaveBalanceSnapshot(
    balance.year,
    balance.total_days,
    balance.used_days,
    nextPending
  );
};

export { getAvatarColor } from "./admin";
