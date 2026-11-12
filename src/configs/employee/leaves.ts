import type { LeaveFilter } from "../../models/employee/leaves";

export const LEAVES_TITLE = "연차 관리";

export const LEAVES_CHATBOT_GUIDE =
  "연차 신청은 AI 도우미에게 말로 요청해 주세요.";

export const LEAVE_FILTERS: { value: LeaveFilter; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "pending", label: "검토 중" },
  { value: "auto", label: "자동 승인" },
  { value: "manual", label: "승인 완료" },
  { value: "rejected", label: "반려" },
];
