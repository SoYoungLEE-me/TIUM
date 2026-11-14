import type {
  AttendanceRecord,
  AttendanceSummary,
  CalendarDay,
  CalendarLeave,
  DayStatus,
} from "../../models/employee/attendance";

const pad = (n: number) => String(n).padStart(2, "0");

/* (2026, 11, 5) → "2026-11-05" */
export const toDateKey = (year: number, month: number, day: number) =>
  `${year}-${pad(month)}-${pad(day)}`;

/* 회사 시간대 기준 오늘 (YYYY-MM-DD) */
export const getTodayKey = () =>
  new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });

/* "2026-11" → { year: 2026, month: 11 } */
export const parseMonthKey = (monthKey: string) => {
  const [year, month] = monthKey.split("-").map(Number);
  return { year, month };
};

/* "2026-11", +1 → "2026-12" */
export const shiftMonth = (monthKey: string, diff: number) => {
  const { year, month } = parseMonthKey(monthKey);
  const date = new Date(year, month - 1 + diff, 1);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
};

/* "2026-11" → "2026년 11월" */
export const formatMonthLabel = (monthKey: string) => {
  const { year, month } = parseMonthKey(monthKey);
  return `${year}년 ${month}월`;
};

/* "2026-11-09" → "11월 9일 (월)" */
export const formatDayLabel = (dateKey: string) => {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });
};

/* 출근~퇴근 → "8시간 07분" */
export const formatWorkDuration = (
  checkIn: string | null,
  checkOut: string | null
) => {
  if (!checkIn || !checkOut) return "-";
  const minutes = Math.max(
    0,
    Math.round((Date.parse(checkOut) - Date.parse(checkIn)) / 60000)
  );
  return `${Math.floor(minutes / 60)}시간 ${pad(minutes % 60)}분`;
};

/* 지각 분 (기본 출근 시각 기준) */
export const getLateMinutes = (
  checkIn: string | null,
  workStartTime: string
) => {
  if (!checkIn) return 0;
  const time = new Date(checkIn).toLocaleTimeString("sv-SE", {
    timeZone: "Asia/Seoul",
  });
  const toMinutes = (hhmm: string) => {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  };
  return Math.max(0, toMinutes(time) - toMinutes(workStartTime));
};

const findLeave = (leaves: CalendarLeave[], dateKey: string) =>
  leaves.find(
    (leave) =>
      leave.status !== "rejected" &&
      leave.status !== "cancelled" &&
      leave.start_date <= dateKey &&
      dateKey <= leave.end_date
  ) ?? null;

const getDayStatus = (
  isWeekend: boolean,
  record: AttendanceRecord | null,
  leave: CalendarLeave | null
): DayStatus => {
  if (isWeekend) return "weekend";
  if (leave) return leave.status === "approved" ? "leave" : "leave_pending";
  if (record?.status === "late") return "late";
  if (record?.check_in) return "present";
  return "none";
};

/*
 * 월요일 시작 캘린더 칸 목록
 * 앞뒤 빈칸은 null (7개씩 끊으면 한 주)
 */
export const buildCalendarDays = (
  monthKey: string,
  records: AttendanceRecord[],
  leaves: CalendarLeave[]
): Array<CalendarDay | null> => {
  const { year, month } = parseMonthKey(monthKey);
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstWeekday = (new Date(year, month - 1, 1).getDay() + 6) % 7; // 월=0
  const todayKey = getTodayKey();
  const recordByDate = new Map(
    records.map((record) => [record.work_date, record])
  );

  const cells: Array<CalendarDay | null> = Array.from(
    { length: firstWeekday },
    () => null
  );

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = toDateKey(year, month, day);
    const weekday = (firstWeekday + day - 1) % 7;
    const record = recordByDate.get(date) ?? null;
    const leave = findLeave(leaves, date);

    cells.push({
      date,
      day,
      isToday: date === todayKey,
      status: getDayStatus(weekday >= 5, record, leave),
      record,
      leave,
    });
  }

  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
};

/* 한 달 상태 집계 */
export const buildAttendanceSummary = (
  days: Array<CalendarDay | null>
): AttendanceSummary =>
  days.reduce<AttendanceSummary>(
    (acc, day) => {
      if (day?.status === "present") acc.present += 1;
      if (day?.status === "late") acc.late += 1;
      if (day?.status === "leave") acc.leave += 1;
      return acc;
    },
    { present: 0, late: 0, leave: 0 }
  );
