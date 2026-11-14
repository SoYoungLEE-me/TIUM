import type {
  AdminLeaveFilter,
  AdminLeaveRequest,
  AdminReviewSummary,
  AdminStatusCounts,
  LeaveBalanceSnapshot,
  LeaveRequestStatus,
} from "../../models/admin/admin";

export const LEAVE_STATUS_LABEL: Record<LeaveRequestStatus, string> = {
  pending: "검토 대기",
  approved: "승인",
  rejected: "반려",
  cancelled: "취소",
};

export const getInitials = (fullName: string) => {
  const trimmed = fullName.trim();
  if (!trimmed) return "?";
  return trimmed.slice(-2);
};

export const formatLeavePeriod = (startDate: string, endDate: string) => {
  const start = formatShortDate(startDate);
  if (startDate === endDate) return start;
  return `${start} - ${formatShortDate(endDate)}`;
};

export const formatShortDate = (date: string) => {
  const [, month, day] = date.split("-");
  return `${month}.${day}`;
};

export const formatDisplayDate = (date: string) => date.replaceAll("-", ".");

export const formatDateTimeParts = (iso: string | null) => {
  if (!iso) return { date: "-", time: "-" };
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return { date: iso, time: "-" };
  }
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return {
    date: `${month}.${day}`,
    time: `${hours}:${minutes}`,
  };
};

export const formatDateTime = (iso: string | null) => {
  const { date, time } = formatDateTimeParts(iso);
  if (date === "-" && time === "-") return "-";
  if (time === "-") return date;
  return `${date} ${time}`;
};

export const formatFullDateTime = (iso: string | null) => {
  if (!iso) return "-";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const y = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${y}-${month}-${day} ${hours}:${minutes}`;
};

export const formatRequestCode = (index: number) => {
  const suffix = String(index + 101).padStart(3, "0");
  return `#LV-${suffix}`;
};

/** pending 자기 예약량을 제외한 잔여로 승인 가능 여부 판단 */
export const canApproveExcludingSelfPending = (
  balance: LeaveBalanceSnapshot,
  requestedDays: number,
) => {
  const availableExcludingSelf =
    balance.remaining_days - (balance.pending_days - requestedDays);
  return availableExcludingSelf >= requestedDays;
};

export const filterAdminLeaveRequests = (
  requests: AdminLeaveRequest[],
  filter: AdminLeaveFilter,
) => {
  const keyword = filter.search.trim().toLowerCase();

  return requests.filter((request) => {
    const statusOk =
      filter.status === "all" ? true : request.status === filter.status;
    if (!statusOk) return false;

    if (
      filter.department !== "all" &&
      request.department !== filter.department
    ) {
      return false;
    }

    if (!keyword) return true;

    return (
      request.employee_full_name.toLowerCase().includes(keyword) ||
      (request.department ?? "").toLowerCase().includes(keyword) ||
      request.leave_type_name.toLowerCase().includes(keyword)
    );
  });
};

export const buildAdminReviewSummary = (
  requests: AdminLeaveRequest[],
): AdminReviewSummary => {
  const pending = requests.filter((r) => r.status === "pending");
  const manualProcessed = requests.filter(
    (r) =>
      (r.status === "approved" || r.status === "rejected") &&
      r.approval_type === "manual",
  );

  const pendingReservedDays = Number(
    pending.reduce((sum, request) => sum + request.total_days, 0).toFixed(1),
  );

  return {
    pending_count: pending.length,
    manual_processed_count: manualProcessed.length,
    pending_reserved_days: pendingReservedDays,
  };
};

export const buildAdminStatusCounts = (
  requests: AdminLeaveRequest[],
): AdminStatusCounts => ({
  pending: requests.filter((r) => r.status === "pending").length,
  approved: requests.filter((r) => r.status === "approved").length,
  rejected: requests.filter((r) => r.status === "rejected").length,
  cancelled: requests.filter((r) => r.status === "cancelled").length,
  all: requests.length,
});

export const getDepartmentOptions = (requests: AdminLeaveRequest[]) => {
  const departments = new Set<string>();
  requests.forEach((request) => {
    if (request.department) departments.add(request.department);
  });
  return Array.from(departments).sort();
};

export { getAvatarColor } from "../profile/avatar";

/** lg 미만(세로 스택)일 때만 상세 패널 앵커로 스크롤 */
export const scrollToStackedDetail = (elementId: string) => {
  if (typeof window === "undefined") return;
  if (!window.matchMedia("(max-width: 1199.95px)").matches) return;

  window.requestAnimationFrame(() => {
    document.getElementById(elementId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  });
};
