import { useMemo, useState } from "react";
import {
  DEFAULT_ADMIN_LEAVE_STATUS,
  MOCK_REVIEWER_ID,
} from "../../configs/admin/admin";
import adminMock from "../../mocks/admin/admin.json";
import type {
  AdminLeaveFilter,
  AdminLeaveRequest,
} from "../../models/admin/admin";
import {
  buildAdminReviewSummary,
  buildAdminStatusCounts,
  canApproveExcludingSelfPending,
  filterAdminLeaveRequests,
  getDepartmentOptions,
} from "../../utils/admin/admin";
import {
  applyApproveDeduction,
  applyRejectRelease,
} from "../../utils/admin/leaves";

const initialRequests = adminMock.requests as AdminLeaveRequest[];

export const useAdminLeaveReview = () => {
  const [requests, setRequests] =
    useState<AdminLeaveRequest[]>(initialRequests);
  const [filter, setFilter] = useState<AdminLeaveFilter>({
    status: DEFAULT_ADMIN_LEAVE_STATUS,
    search: "",
    department: "all",
  });
  const [selectedId, setSelectedId] = useState<string | null>(
    () => initialRequests.find((r) => r.status === "pending")?.id ?? null
  );
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const summary = useMemo(
    () => buildAdminReviewSummary(requests),
    [requests]
  );
  const statusCounts = useMemo(
    () => buildAdminStatusCounts(requests),
    [requests]
  );
  const departments = useMemo(
    () => getDepartmentOptions(requests),
    [requests]
  );

  const filteredRequests = useMemo(
    () => filterAdminLeaveRequests(requests, filter),
    [requests, filter]
  );

  const selectedRequest =
    requests.find((request) => request.id === selectedId) ?? null;

  const selectedIndex = selectedRequest
    ? requests.findIndex((request) => request.id === selectedRequest.id)
    : -1;

  const setStatusFilter = (status: AdminLeaveFilter["status"]) => {
    setFilter((prev) => ({ ...prev, status }));
  };

  const setSearch = (search: string) => {
    setFilter((prev) => ({ ...prev, search }));
  };

  const setDepartment = (department: string) => {
    setFilter((prev) => ({ ...prev, department }));
  };

  const selectRequest = (id: string) => {
    setSelectedId(id);
    setActionError(null);
    setActionMessage(null);
  };

  const syncEmployeeBalances = (
    list: AdminLeaveRequest[],
    employeeId: string,
    nextBalance: AdminLeaveRequest["balance"]
  ) =>
    list.map((request) =>
      request.employee_id === employeeId
        ? { ...request, balance: nextBalance }
        : request
    );

  const approveRequest = async (reason: string) => {
    if (!selectedRequest || selectedRequest.status !== "pending") return;
    setProcessing(true);
    setActionError(null);
    setActionMessage(null);

    if (
      !canApproveExcludingSelfPending(
        selectedRequest.balance,
        selectedRequest.total_days
      )
    ) {
      setActionError("잔여 연차가 부족하여 승인할 수 없습니다.");
      setProcessing(false);
      return;
    }

    const nextBalance = applyApproveDeduction(
      selectedRequest.balance,
      selectedRequest.total_days
    );
    const reviewedAt = new Date().toISOString();

    setRequests((prev) => {
      const updated = prev.map((request) =>
        request.id === selectedRequest.id
          ? {
              ...request,
              status: "approved" as const,
              approval_type: "manual" as const,
              decision_reason: reason.trim() || "HR 수동 승인",
              reviewed_by: MOCK_REVIEWER_ID,
              reviewed_at: reviewedAt,
              balance: nextBalance,
            }
          : request
      );
      return syncEmployeeBalances(
        updated,
        selectedRequest.employee_id,
        nextBalance
      );
    });

    setActionMessage("승인 처리되었습니다. (mock)");
    setProcessing(false);
  };

  const rejectRequest = async (reason: string) => {
    if (!selectedRequest || selectedRequest.status !== "pending") return;
    const trimmed = reason.trim();
    if (!trimmed) {
      setActionError("반려 사유를 입력해 주세요.");
      return;
    }

    setProcessing(true);
    setActionError(null);
    setActionMessage(null);

    const nextBalance = applyRejectRelease(
      selectedRequest.balance,
      selectedRequest.total_days
    );
    const reviewedAt = new Date().toISOString();

    setRequests((prev) => {
      const updated = prev.map((request) =>
        request.id === selectedRequest.id
          ? {
              ...request,
              status: "rejected" as const,
              approval_type: "manual" as const,
              decision_reason: trimmed,
              reviewed_by: MOCK_REVIEWER_ID,
              reviewed_at: reviewedAt,
              balance: nextBalance,
            }
          : request
      );
      return syncEmployeeBalances(
        updated,
        selectedRequest.employee_id,
        nextBalance
      );
    });

    setActionMessage("반려 처리되었습니다. (mock)");
    setProcessing(false);
  };

  return {
    filter,
    filteredRequests,
    selectedRequest,
    selectedIndex,
    summary,
    statusCounts,
    departments,
    actionError,
    actionMessage,
    processing,
    setStatusFilter,
    setSearch,
    setDepartment,
    selectRequest,
    approveRequest,
    rejectRequest,
  };
};
