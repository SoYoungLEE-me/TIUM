export const ADMIN_SETTINGS_MAX_WIDTH = 900;

export const ADMIN_SETTINGS_TITLE = "규정 · AI 설정";
export const ADMIN_SETTINGS_DESCRIPTION =
  "기본 근무시간, 자동 승인, 승인 규칙, 휴가 유형을 관리합니다.";

export const SETTINGS_SAVED_STATUS = "현재 규정이 저장되어 있어요.";
export const SETTINGS_DIRTY_STATUS = "변경사항이 있어요. 저장해 주세요.";

/** 신청 시 항상 검증되는 조건 (토글 없음) */
export const ALWAYS_ENFORCED_APPROVAL_CHECKS: Array<{
  title: string;
  description: string;
}> = [
  {
    title: "잔여 연차 충분",
    description: "신청 일수가 잔여 연차 이하인지 항상 검사합니다.",
  },
  {
    title: "기존 신청과 중복 없음",
    description: "같은 날짜에 승인 · 대기 중인 신청이 없는지 항상 검사합니다.",
  },
];

export const DEFAULT_MAX_CONSECUTIVE_DAYS = 3;

export const TIME_MINUTE_STEP = 10;

export const TIME_PERIOD_OPTIONS = [
  { value: "am", label: "오전" },
  { value: "pm", label: "오후" },
];

/** 12시간제 시 (01~12) */
export const TIME_HOUR_12_OPTIONS = Array.from({ length: 12 }, (_, index) =>
  String(index + 1).padStart(2, "0"),
);

export const TIME_MINUTE_OPTIONS = Array.from(
  { length: 60 / TIME_MINUTE_STEP },
  (_, index) => String(index * TIME_MINUTE_STEP).padStart(2, "0"),
);
