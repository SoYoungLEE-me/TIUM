import { useMemo, useState } from "react";
import {
  ADMIN_REVIEW_PAGE_SIZE,
  DEFAULT_ADMIN_LEAVE_STATUS,
} from "../../configs/admin/admin";
import {
  useAdminLeave,
  useAdminLeaves,
  useApproveAdminLeave,
  useRejectAdminLeave,
} from "../apis/useAdminLeaves";
import type {
  AdminLeaveFilter,
  AdminLeaveRequest,
  LeaveBalanceSnapshot,
} from "../../models/admin/admin";
import type { AdminLeaveListItem } from "../../models/apis/admin";
import type { Balance } from "../../models/apis/leave";
import {
  buildAdminReviewSummary,
  buildAdminStatusCounts,
  canApproveExcludingSelfPending,
  filterAdminLeaveRequests,
  getDepartmentOptions,
} from "../../utils/admin/admin";
import { buildLeaveBalanceSnapshot } from "../../utils/admin/leaves";
import { toast } from "../../common/components/toast";
import { ApiRequestError } from "../../models/apis/common";

const emptyBalance = (year: number): LeaveBalanceSnapshot =>
  buildLeaveBalanceSnapshot(year, 0, 0, 0);

const toSnapshot = (balance: Balance): LeaveBalanceSnapshot => ({
  year: balance.year,
  total_days: balance.total_days,
  used_days: balance.used_days,
  remaining_days: balance.remaining_days,
  pending_days: balance.pending_days,
  available_days: balance.available_days,
});

const mapListItem = (
  item: AdminLeaveListItem,
  balance?: LeaveBalanceSnapshot,
): AdminLeaveRequest => {
  const { request, employee } = item;
  const year =
    Number(request.start_date.slice(0, 4)) || new Date().getFullYear();
  return {
    id: request.id,
    employee_id: request.employee_id,
    employee_full_name: employee.full_name,
    employee_email: employee.email,
    department: employee.department,
    leave_type_id: request.leave_type_id,
    leave_type_name: request.leave_type_name ?? "",
    start_date: request.start_date,
    end_date: request.end_date,
    total_days: request.total_days,
    reason: request.reason,
    status: request.status,
    approval_type: request.approval_type,
    decision_reason: request.decision_reason,
    reviewed_by: request.reviewed_by,
    reviewed_at: request.reviewed_at,
    created_at: request.created_at,
    balance: balance ?? emptyBalance(year),
  };
};

export const useAdminLeaveReview = () => {
  const [filter, setFilter] = useState<AdminLeaveFilter>({
    status: DEFAULT_ADMIN_LEAVE_STATUS,
    search: "",
    department: "all",
  });
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // status/department/search는 클라이언트에서만 필터 — 요약·탭 카운트가 항상 전체 기준
  const leavesQuery = useAdminLeaves({ page_size: 100 });
  const approveMutation = useApproveAdminLeave();
  const rejectMutation = useRejectAdminLeave();

  const requests = useMemo(() => {
    const items = leavesQuery.data?.data ?? [];
    return items.map((item) => mapListItem(item));
  }, [leavesQuery.data]);

  const summary = useMemo(() => buildAdminReviewSummary(requests), [requests]);
  const statusCounts = useMemo(
    () => buildAdminStatusCounts(requests),
    [requests],
  );
  const departments = useMemo(() => getDepartmentOptions(requests), [requests]);

  const filteredRequests = useMemo(
    () => filterAdminLeaveRequests(requests, filter),
    [requests, filter],
  );

  const pageCount = Math.max(
    1,
    Math.ceil(filteredRequests.length / ADMIN_REVIEW_PAGE_SIZE),
  );
  const safePage = Math.min(page, pageCount);
  const pagedRequests = useMemo(() => {
    const start = (safePage - 1) * ADMIN_REVIEW_PAGE_SIZE;
    return filteredRequests.slice(start, start + ADMIN_REVIEW_PAGE_SIZE);
  }, [filteredRequests, safePage]);

  // 목록 맨 위 항목을 기본 선택. 필터 결과 없으면 선택 해제 (effect 없이 파생)
  const resolvedSelectedId = useMemo(() => {
    if (filteredRequests.length === 0) return null;
    if (
      selectedId &&
      filteredRequests.some((request) => request.id === selectedId)
    ) {
      return selectedId;
    }
    return filteredRequests[0].id;
  }, [filteredRequests, selectedId]);

  const detailQuery = useAdminLeave(
    resolvedSelectedId ?? "",
    Boolean(resolvedSelectedId),
  );

  const selectedRequest = useMemo(() => {
    const base =
      filteredRequests.find((request) => request.id === resolvedSelectedId) ??
      null;
    if (!base || !detailQuery.data) return base;
    return {
      ...base,
      balance: detailQuery.data.balance
        ? toSnapshot(detailQuery.data.balance)
        : base.balance,
      status: detailQuery.data.request.status,
      decision_reason: detailQuery.data.request.decision_reason,
      reviewed_by: detailQuery.data.request.reviewed_by,
      reviewed_at: detailQuery.data.request.reviewed_at,
      approval_type: detailQuery.data.request.approval_type,
    };
  }, [filteredRequests, resolvedSelectedId, detailQuery.data]);

  const selectedIndex = selectedRequest
    ? filteredRequests.findIndex((request) => request.id === selectedRequest.id)
    : -1;

  const clearActionFeedback = () => {
    setActionError(null);
    setActionMessage(null);
  };

  const setStatusFilter = (status: AdminLeaveFilter["status"]) => {
    setFilter((prev) => ({ ...prev, status }));
    setPage(1);
    clearActionFeedback();
  };

  const setSearch = (search: string) => {
    setFilter((prev) => ({ ...prev, search }));
    setPage(1);
    clearActionFeedback();
  };

  const setDepartment = (department: string) => {
    setFilter((prev) => ({ ...prev, department }));
    setPage(1);
    clearActionFeedback();
  };

  const selectRequest = (id: string) => {
    setSelectedId(id);
    clearActionFeedback();
  };

  const approveRequest = async (reason: string) => {
    console.log(reason);

    if (!selectedRequest || selectedRequest.status !== "pending") return;

    if (
      !canApproveExcludingSelfPending(
        selectedRequest.balance,
        selectedRequest.total_days,
      )
    ) {
      const msg = "잔여 연차가 부족하여 승인할 수 없습니다.";
      setActionError(msg);
      toast.warning(msg);
      return;
    }

    clearActionFeedback();
    try {
      await approveMutation.mutateAsync(selectedRequest.id);
      toast.success("승인 처리되었습니다.");
      void leavesQuery.refetch();
      void detailQuery.refetch();
    } catch (err) {
      const msg =
        err instanceof ApiRequestError
          ? err.message
          : err instanceof Error
            ? err.message
            : "승인에 실패했습니다.";
      setActionError(msg);
      toast.error(msg);
    }
  };

  const rejectRequest = async (reason: string) => {
    if (!selectedRequest || selectedRequest.status !== "pending") return;
    const trimmed = reason.trim();
    if (!trimmed) {
      const msg = "반려 사유를 입력해 주세요.";
      setActionError(msg);
      toast.warning(msg);
      return;
    }

    clearActionFeedback();
    try {
      await rejectMutation.mutateAsync({
        requestId: selectedRequest.id,
        body: { reason: trimmed },
      });
      toast.success("반려 처리되었습니다.");
      void leavesQuery.refetch();
      void detailQuery.refetch();
    } catch (err) {
      const msg =
        err instanceof ApiRequestError
          ? err.message
          : err instanceof Error
            ? err.message
            : "반려에 실패했습니다.";
      setActionError(msg);
      toast.error(msg);
    }
  };

  return {
    filter,
    filteredRequests,
    pagedRequests,
    page: safePage,
    pageCount,
    selectedRequest,
    selectedIndex,
    summary,
    statusCounts,
    departments,
    actionError,
    actionMessage,
    processing: approveMutation.isPending || rejectMutation.isPending,
    isLoading: leavesQuery.isLoading,
    isError: leavesQuery.isError,
    errorMessage:
      leavesQuery.error instanceof Error
        ? leavesQuery.error.message
        : leavesQuery.isError
          ? "목록을 불러오지 못했습니다."
          : null,
    setStatusFilter,
    setSearch,
    setDepartment,
    setPage,
    selectRequest,
    approveRequest,
    rejectRequest,
  };
};
