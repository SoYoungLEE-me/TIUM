import type { WorkStatus } from "../../models/employee/dashboard";

export const DASHBOARD_TITLE = "대시보드";

export const DASHBOARD_RECENT_REQUEST_COUNT = 3;

export const DASHBOARD_LOAD_ERROR =
  "대시보드를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.";

export const CHECK_IN_SUCCESS = "출근이 기록됐어요.";
export const CHECK_OUT_SUCCESS = "퇴근이 기록됐어요.";
export const CHECK_IN_FAILED = "출근 기록에 실패했어요.";
export const CHECK_OUT_FAILED = "퇴근 기록에 실패했어요.";

/*출퇴근  RPC 에러 코드 → 안내 문구 */
export const ATTENDANCE_ERROR_MESSAGE: Record<string, string> = {
  ALREADY_CHECKED_IN: "이미 출근이 기록됐어요.",
  CHECK_IN_REQUIRED: "출근 기록이 없어서 퇴근할 수 없어요.",
  ALREADY_CHECKED_OUT: "이미 퇴근이 기록됐어요.",
  SETTINGS_NOT_FOUND: "회사 근무 설정이 없어요. 인사 담당자에게 문의해 주세요.",
  UNAUTHORIZED: "로그인이 필요해요.",
};

export const WORK_STATUS_CHIP: Record<
  WorkStatus,
  { label: string; bg: string; fg: string }
> = {
  before: { label: "출근 전", bg: "#F1EEE8", fg: "#6E6670" },
  working: { label: "근무 중", bg: "#E7F1E3", fg: "#3F6E3A" },
  done: { label: "퇴근", bg: "#F1E8F1", fg: "#744577" },
};
