import { useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getAttendanceRecords, monthToDateRange } from "../../apis/attendance";
import { DEFAULT_WORK_START_TIME } from "../../configs/employee/attendance";
import {
  buildAttendanceSummary,
  buildCalendarDays,
  getTodayKey,
  shiftMonth,
} from "../../utils/employee/attendance";
import { toCalendarLeave } from "../../utils/employee/leaves";
import { queryKeys } from "../apis/queryKeys";
import { useCompanyPolicy } from "../apis/useCompanyPolicy";
import { useMyLeaveRequests } from "../apis/useLeaves";

export const useEmployeeAttendance = () => {
  const todayKey = getTodayKey();
  const [monthKey, setMonthKey] = useState(todayKey.slice(0, 7)); // "2026-11"
  const [selectedDate, setSelectedDate] = useState<string>(todayKey);

  // useAttendanceRecords와 같은 queryKey라 캐시와 출퇴근 후 갱신은 그대로 공유된다.
  // 달을 옮길 때 화면이 스켈레톤으로 깜빡이지 않도록 이전 달을 유지하는 옵션만 추가
  const recordsQuery = useQuery({
    queryKey: [...queryKeys.attendance(monthKey), "self"],
    queryFn: () => getAttendanceRecords(monthToDateRange(monthKey)),
    placeholderData: keepPreviousData,
  });
  // 달을 넘는 연차도 칸에 칠해야 해서 내 신청 전체를 받아 캘린더에서 걸러 낸다
  const leavesQuery = useMyLeaveRequests();
  const policyQuery = useCompanyPolicy();

  const days = useMemo(
    () =>
      buildCalendarDays(
        monthKey,
        recordsQuery.data ?? [],
        (leavesQuery.data ?? []).map(toCalendarLeave)
      ),
    [monthKey, recordsQuery.data, leavesQuery.data]
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
    workStartTime:
      policyQuery.data?.company_settings.work_start_time ??
      DEFAULT_WORK_START_TIME,
    isThisMonth: monthKey === todayKey.slice(0, 7),
    isLoading: recordsQuery.isLoading || leavesQuery.isLoading,
    isError: recordsQuery.isError || leavesQuery.isError,
    selectDate: setSelectedDate,
    goPrevMonth,
    goNextMonth,
    goThisMonth,
  };
};
