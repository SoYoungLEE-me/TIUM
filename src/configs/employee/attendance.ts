import type { DayStatus } from "../../models/employee/attendance";

export const ATTENDANCE_TITLE = "근태 관리";
export const ATTENDANCE_DESCRIPTION =
  "승인된 연차는 캘린더에 자동으로 표시돼요.";

/** 월요일 시작 */
export const WEEKDAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];

/** 캘린더 칸 색 · 라벨 */
export const DAY_STATUS_STYLE: Record<
  DayStatus,
  { label: string; bg: string; border: string; fg: string }
> = {
  present: { label: "정상", bg: "#EEF5EB", border: "#D6E7D0", fg: "#3F6E3A" },
  late: { label: "지각", bg: "#FAF6DD", border: "#EADF9C", fg: "#6B5D10" },
  leave: { label: "연차", bg: "#84C5B1", border: "#84C5B1", fg: "#1E3B33" },
  leave_pending: {
    label: "검토 중",
    bg: "#F1E8F1",
    border: "#DCC6DD",
    fg: "#744577",
  },
  weekend: { label: "", bg: "#F1EEE8", border: "#F1EEE8", fg: "#6E6670" },
  none: { label: "", bg: "#FFFFFF", border: "#ECE7DE", fg: "#6E6670" },
};

/** 범례에 보여 줄 상태 */
export const LEGEND_STATUSES: DayStatus[] = [
  "present",
  "late",
  "leave",
  "leave_pending",
];
