import type { AdminLeaveFilterStatus } from "../../models/admin/admin";

export const ADMIN_REVIEW_MAX_WIDTH = 1280;

export const ADMIN_REVIEW_TITLE = "신청 검토";
export const ADMIN_REVIEW_DESCRIPTION =
  "대기 중인 연차 신청을 확인하고 승인·반려를 처리합니다.";

export const ADMIN_REVIEW_FOOTER_TIP =
  "검토 대기 연차는 원장에 바로 차감되지 않으며, 승인 시점에 사용 일수로 반영됩니다.";

export const DEFAULT_ADMIN_LEAVE_STATUS: AdminLeaveFilterStatus = "pending";

export const ADMIN_LEAVE_STATUS_TABS: Array<{
  value: AdminLeaveFilterStatus;
  label: string;
}> = [
  { value: "pending", label: "검토 대기" },
  { value: "approved", label: "승인" },
  { value: "rejected", label: "반려" },
  { value: "all", label: "전체" },
];

export const MOCK_REVIEWER_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

export const ADMIN_REVIEW_DETAIL_ANCHOR_ID = "admin-review-detail";
