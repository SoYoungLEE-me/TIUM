import { useMemo, useState } from "react";
import {
  DEFAULT_LEAVE_YEAR,
  LEAVES_PAGE_SIZE,
} from "../../configs/admin/leaves";
import {
  useAdminEmployeeBalances,
  useGrantLeave,
} from "../apis/useAdminEmployees";
import type {
  EmployeeLeaveFilter,
  EmployeeLeaveRow,
  GrantLeaveInput,
} from "../../models/admin/leaves";
import { toast } from "../../common/components/toast";
import { ApiRequestError } from "../../models/apis/common";
import {
  buildLeaveBalanceSnapshot,
  buildLeavesPageSummary,
  filterEmployeeLeaveRows,
  getEmployeeDepartments,
} from "../../utils/admin/leaves";

export const useAdminEmployeeLeaves = () => {
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

  // 부서·검색은 클라이언트만 필터 — 선택해도 드롭다운 옵션(li)이 줄어들지 않음
  const balancesQuery = useAdminEmployeeBalances({
    year: filter.year,
    page: 1,
    page_size: 200,
  });
  const grantMutation = useGrantLeave();

  const rows: EmployeeLeaveRow[] = useMemo(() => {
    const items = balancesQuery.data?.data ?? [];
    return items.map((item) => ({
      employee: {
        id: item.employee.id,
        full_name: item.employee.full_name,
        email: item.employee.email,
        department: item.employee.department,
        role: item.employee.role,
      },
      balance: item.balance
        ? {
            year: item.balance.year,
            total_days: item.balance.total_days,
            used_days: item.balance.used_days,
            remaining_days: item.balance.remaining_days,
            pending_days: item.balance.pending_days,
            available_days: item.balance.available_days,
          }
        : buildLeaveBalanceSnapshot(filter.year, 0, 0, 0),
      requests: [],
      history: [],
    }));
  }, [balancesQuery.data, filter.year]);

  const departments = useMemo(() => getEmployeeDepartments(rows), [rows]);

  const filteredRows = useMemo(
    () => filterEmployeeLeaveRows(rows, filter),
    [rows, filter]
  );

  const summary = useMemo(
    () => buildLeavesPageSummary(filteredRows),
    [filteredRows]
  );

  const pageCount = Math.max(
    1,
    Math.ceil(filteredRows.length / LEAVES_PAGE_SIZE)
  );
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

  const grantLeave = async (input: GrantLeaveInput) => {
    if (!input.employee_id) {
      const msg = "직원을 선택해 주세요.";
      setError(msg);
      toast.warning(msg);
      return false;
    }
    if (input.days <= 0) {
      const msg = "부여 일수는 0보다 커야 합니다.";
      setError(msg);
      toast.warning(msg);
      return false;
    }

    setError(null);
    setMessage(null);
    try {
      await grantMutation.mutateAsync({
        employee_id: input.employee_id,
        year: filter.year,
        days: input.days,
        reason: input.reason || "사유 없음",
        submission_key: `grant-${Date.now()}`,
      });
      const successMsg = `${input.days}일이 부여되었습니다. (${input.reason || "사유 없음"})`;
      setMessage(null);
      toast.success(successMsg);
      closeGrantDialog();
      void balancesQuery.refetch();
      return true;
    } catch (err) {
      const msg =
        err instanceof ApiRequestError
          ? err.message
          : err instanceof Error
            ? err.message
            : "연차 부여에 실패했습니다.";
      setError(msg);
      toast.error(msg);
      return false;
    }
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
    isLoading: balancesQuery.isLoading,
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
