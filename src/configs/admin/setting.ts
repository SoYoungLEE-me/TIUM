import type { Workday } from "../../models/admin/setting";

export const ADMIN_SETTINGS_MAX_WIDTH = 900;

export const ADMIN_SETTINGS_TITLE = "규정 · AI 설정";
export const ADMIN_SETTINGS_DESCRIPTION =
  "기본 근무시간, 근무 요일, 자동 승인, 승인 규칙, 휴가 유형을 관리합니다.";

export const SETTINGS_SAVED_STATUS = "현재 규정이 저장되어 있어요.";
export const SETTINGS_DIRTY_STATUS = "변경사항이 있어요. 저장해 주세요.";

export const WORKDAY_OPTIONS: Array<{ value: Workday; label: string }> = [
  { value: 1, label: "월" },
  { value: 2, label: "화" },
  { value: 3, label: "수" },
  { value: 4, label: "목" },
  { value: 5, label: "금" },
  { value: 6, label: "토" },
  { value: 7, label: "일" },
];

export const DEFAULT_WORKDAYS: Workday[] = [1, 2, 3, 4, 5];

export const AUTO_APPROVAL_CONDITIONS: Array<{
  id: string;
  title: string;
  description: string;
}> = [
  {
    id: "sufficient_balance",
    title: "잔여 연차 충분",
    description: "신청 일수가 잔여 연차 이하",
  },
  {
    id: "no_overlap",
    title: "기존 신청과 중복 없음",
    description: "같은 날짜에 승인 · 대기 중인 신청 없음",
  },
  {
    id: "no_attendance_conflict",
    title: "근태 기록과 충돌 없음",
    description: "해당 날짜에 출퇴근 기록 없음",
  },
  {
    id: "notice_deadline",
    title: "신청 기한 충족",
    description: "규정의 신청 기한 이전에 신청",
  },
  {
    id: "consecutive_limit",
    title: "연속 사용 한도 이하",
    description: "아래 한도를 넘으면 관리자 검토",
  },
];

export const TIME_MINUTE_STEP = 10;

export const TIME_PERIOD_OPTIONS = [
  { value: "am" as const, label: "오전" },
  { value: "pm" as const, label: "오후" },
];

/** 12시간제 시 (01~12) */
export const TIME_HOUR_12_OPTIONS = Array.from({ length: 12 }, (_, index) =>
  String(index + 1).padStart(2, "0")
);

export const TIME_MINUTE_OPTIONS = Array.from(
  { length: 60 / TIME_MINUTE_STEP },
  (_, index) => String(index * TIME_MINUTE_STEP).padStart(2, "0")
);
