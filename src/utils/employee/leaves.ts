import type { LeaveRequest } from "../../models/apis/leave";
import type { CalendarLeave } from "../../models/employee/attendance";
import type {
  LeaveFilter,
  LeaveHistoryItem,
} from "../../models/employee/leaves";

/* API 연차 신청 → 신청 내역 행 */
export const toLeaveHistoryItem = (
  request: LeaveRequest
): LeaveHistoryItem => ({
  ...request,
  leave_type_name: request.leave_type_name ?? "",
});

/* API 연차 신청 → 캘린더 연차 */
export const toCalendarLeave = (request: LeaveRequest): CalendarLeave => ({
  id: request.id,
  leave_type_name: request.leave_type_name ?? "",
  start_date: request.start_date,
  end_date: request.end_date,
  total_days: request.total_days,
  status: request.status,
  approval_type: request.approval_type,
});

/* 필터 조건 */
export const matchesLeaveFilter = (
  request: LeaveHistoryItem,
  filter: LeaveFilter
) => {
  switch (filter) {
    case "all":
      return true;
    case "pending":
      return request.status === "pending";
    case "auto":
      return request.status === "approved" && request.approval_type === "auto";
    case "manual":
      return request.status === "approved" && request.approval_type !== "auto";
    case "rejected":
      return request.status === "rejected";
  }
};

/* 필터별 건수 */
export const countByLeaveFilter = (
  requests: LeaveHistoryItem[],
  filter: LeaveFilter
) => requests.filter((request) => matchesLeaveFilter(request, filter)).length;

/* 회사 시간대 기준*/
export const formatAppliedDate = (iso: string) =>
  new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    timeZone: "Asia/Seoul",
  });

/* 최신 신청 순 */
export const sortByCreatedDesc = (requests: LeaveHistoryItem[]) =>
  [...requests].sort((a, b) => b.created_at.localeCompare(a.created_at));
