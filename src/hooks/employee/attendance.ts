import { useMemo, useState } from "react";
import attendanceMock from "../../mocks/employee/attendance.json";
import type { AttendanceData } from "../../models/employee/attendance";
import {
  buildAttendanceSummary,
  buildCalendarDays,
  getTodayKey,
  shiftMonth,
} from "../../utils/employee/attendance";

// TODO: Supabase 연결 후 attendance_records · leave_requests 조회로 교체
const data = attendanceMock as AttendanceData;

export const useEmployeeAttendance = () => {
  const todayKey = getTodayKey();
  const [monthKey, setMonthKey] = useState(todayKey.slice(0, 7)); // "2026-11"
  const [selectedDate, setSelectedDate] = useState<string>(todayKey);

  const days = useMemo(
    () => buildCalendarDays(monthKey, data.records, data.leaves),
    [monthKey]
  );
  const summary = useMemo(() => buildAttendanceSummary(days), [days]);

  const selectedDay = days.find((day) => day?.date === selectedDate) ?? null;

  const goPrevMonth = () => setMonthKey((prev) => shiftMonth(prev, -1));
  const goNextMonth = () => setMonthKey((prev) => shiftMonth(prev, 1));
  const goThisMonth = () => {
    setMonthKey(todayKey.slice(0, 7));
    setSelectedDate(todayKey);
  };

  return {
    monthKey,
    days,
    summary,
    selectedDay,
    workStartTime: data.work_start_time,
    isThisMonth: monthKey === todayKey.slice(0, 7),
    selectDate: setSelectedDate,
    goPrevMonth,
    goNextMonth,
    goThisMonth,
  };
};
