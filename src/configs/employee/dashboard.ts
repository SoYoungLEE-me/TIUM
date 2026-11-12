import type { WorkStatus } from "../../models/employee/dashboard";

export const DASHBOARD_TITLE = "대시보드";

export const DASHBOARD_RECENT_REQUEST_COUNT = 3;

// TODO: Supabase 연결 후 company_settings의 work_start_time / work_end_time으로 교체
export const DASHBOARD_WORK_HOURS_LABEL = "기본 근무 09:00 – 18:00";

export const WORK_STATUS_CHIP: Record<
  WorkStatus,
  { label: string; bg: string; fg: string }
> = {
  before: { label: "출근 전", bg: "#F1EEE8", fg: "#6E6670" },
  working: { label: "근무 중", bg: "#E7F1E3", fg: "#3F6E3A" },
  done: { label: "퇴근", bg: "#F1E8F1", fg: "#744577" },
};
