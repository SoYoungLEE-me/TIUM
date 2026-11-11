import { useMemo, useState } from "react";
import {
  DEFAULT_LEAVE_YEAR,
  LEAVES_PAGE_SIZE,
} from "../../configs/admin/leaves";
import leavesMock from "../../mocks/admin/leaves.json";
import type {
  EmployeeLeaveFilter,
  EmployeeLeaveRow,
  GrantLeaveInput,
} from "../../models/admin/leaves";
import {
  applyGrantDays,
  buildLeavesPageSummary,
  filterEmployeeLeaveRows,
  getEmployeeDepartments,
} from "../../utils/admin/leaves";

const initialRows = leavesMock.rows as EmployeeLeaveRow[];

export const useAdminEmployeeLeaves = () => {
  const [rows, setRows] = useState<EmployeeLeaveRow[]>(initialRows);
  const [filter, setFilter] = useState<EmployeeLeaveFilter>({
    year: DEFAULT_LEAVE_YEAR,
    search: "",
    department: "all",
  });
  const [page, setPage] = useState(1);
  const [grantTargetId, setGrantTargetId] = useState<string | null>(null);
  const [grantOpen, setGrantOpen] = useState(false);
  const [detailTargetId, setDetailTargetId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const departments = useMemo(() => getEmployeeDepartments(rows), [rows]);

  const filteredRows = useMemo(
    () => filterEmployeeLeaveRows(rows, filter),
    [rows, filter]
  );

  const summary = useMemo(
    () => buildLeavesPageSummary(filteredRows),
    [filteredRows]
  );

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / LEAVES_PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pagedRows = useMemo(() => {
    const start = (safePage - 1) * LEAVES_PAGE_SIZE;
    return filteredRows.slice(start, start + LEAVES_PAGE_SIZE);
  }, [filteredRows, safePage]);

  const grantTarget =
    rows.find((row) => row.employee.id === grantTargetId) ?? null;
  const detailTarget =
    rows.find((row) => row.employee.id === detailTargetId) ?? null;

  const setYear = (year: number) => {
    setFilter((prev) => ({ ...prev, year }));
    setPage(1);
  };

  const setSearch = (search: string) => {
    setFilter((prev) => ({ ...prev, search }));
    setPage(1);
  };

  const setDepartment = (department: string) => {
    setFilter((prev) => ({ ...prev, department }));
    setPage(1);
  };

  const openGrantDialog = (employeeId?: string) => {
    setGrantTargetId(employeeId ?? null);
    setGrantOpen(true);
    setError(null);
    setMessage(null);
  };

  const closeGrantDialog = () => {
    setGrantOpen(false);
    setGrantTargetId(null);
    setError(null);
  };

  const openDetailDialog = (employeeId: string) => {
    setDetailTargetId((prev) => (prev === employeeId ? null : employeeId));
  };

  const closeDetailDialog = () => {
    setDetailTargetId(null);
  };

  const grantLeave = (input: GrantLeaveInput) => {
    if (!input.employee_id) {
      setError("직원을 선택해 주세요.");
      return false;
    }
    if (input.days <= 0) {
      setError("부여 일수는 0보다 커야 합니다.");
      return false;
    }

    setRows((prev) =>
      prev.map((row) =>
        row.employee.id === input.employee_id
          ? {
              ...row,
              balance: applyGrantDays(row.balance, input.days),
              history: [
                {
                  id: `hist-${Date.now()}`,
                  category: "부여",
                  change_days: input.days,
                  reason: input.reason || "사유 없음",
                  processed_at: new Date().toISOString(),
                },
                ...(row.history ?? []),
              ],
            }
          : row
      )
    );
    setMessage(
      `${input.days}일이 부여되었습니다. (${input.reason || "사유 없음"}) — mock`
    );
    closeGrantDialog();
    return true;
  };

  return {
    filter,
    departments,
    filteredRows,
    pagedRows,
    summary,
    page: safePage,
    pageCount,
    grantOpen,
    grantTarget,
    detailTarget,
    allRows: rows,
    message,
    error,
    setYear,
    setSearch,
    setDepartment,
    setPage,
    openGrantDialog,
    closeGrantDialog,
    openDetailDialog,
    closeDetailDialog,
    grantLeave,
  };
};
