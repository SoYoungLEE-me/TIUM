import type { WorkStatus } from "../../models/employee/dashboard";

const TIME_ZONE = "Asia/Seoul";

/* "2026-11-12" → Date (로컬 자정) */
const toDate = (ymd: string) => new Date(`${ymd}T00:00:00`);

/* ISO → "08:54" (없으면 "--:--") */
export const formatTime = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: TIME_ZONE,
      })
    : "--:--";

/* 오늘 → "2026년 11월 12일 목요일" */
export const formatTodayLabel = () =>
  new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
    timeZone: TIME_ZONE,
  });

/* "2026-11-16", "2026-11-18" → "11. 16. (월) – 11. 18. (수)" */
export const formatLeavePeriod = (startDate: string, endDate: string) => {
  const format = (ymd: string) =>
    toDate(ymd).toLocaleDateString("ko-KR", {
      month: "numeric",
      day: "numeric",
      weekday: "short",
    });
  return startDate === endDate
    ? format(startDate)
    : `${format(startDate)} – ${format(endDate)}`;
};

/* "2026-11-16" → { month: 11, day: 16 } (날짜 뱃지용) */
export const getMonthDay = (ymd: string) => {
  const [, month, day] = ymd.split("-");
  return { month: Number(month), day: Number(day) };
};

/* 출퇴근 기록 → 근무 상태 */
export const getWorkStatus = (
  checkIn: string | null,
  checkOut: string | null
): WorkStatus => {
  if (!checkIn) return "before";
  if (!checkOut) return "working";
  return "done";
};

/* 막대 그래프 너비 (%) */
export const toPercent = (value: number, total: number) =>
  total > 0 ? `${Math.min((value / total) * 100, 100)}%` : "0%";

/* API 에러 → 화면 안내 문구 (에러 코드별 문구가 있으면 그걸 사용) */
export const toErrorMessage = (
  error: unknown,
  fallback: string,
  messages: Record<string, string> = {}
) => (error instanceof Error ? messages[error.message] ?? fallback : fallback);

/* "09:00", "18:00" → "기본 근무 09:00 – 18:00" */
export const formatWorkHours = (start: string, end: string) =>
  `기본 근무 ${start.slice(0, 5)} – ${end.slice(0, 5)}`;
