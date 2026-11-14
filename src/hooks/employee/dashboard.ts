import { useMemo } from "react";
import { toast } from "../../common/components/toast";
import {
  ATTENDANCE_ERROR_MESSAGE,
  CHECK_IN_FAILED,
  CHECK_IN_SUCCESS,
  CHECK_OUT_FAILED,
  CHECK_OUT_SUCCESS,
  DASHBOARD_RECENT_REQUEST_COUNT,
} from "../../configs/employee/dashboard";
import {
  DEFAULT_WORK_END_TIME,
  DEFAULT_WORK_START_TIME,
} from "../../configs/employee/attendance";
import { useCheckIn, useCheckOut } from "../apis/useAttendance";
import { useCompanyPolicy } from "../apis/useCompanyPolicy";
import { useDashboard } from "../apis/useDashboard";
import {
  formatWorkHours,
  getWorkStatus,
  toErrorMessage,
} from "../../utils/employee/dashboard";

export const useEmployeeDashboard = () => {
  const dashboardQuery = useDashboard();
  const policyQuery = useCompanyPolicy();
  const checkInMutation = useCheckIn();
  const checkOutMutation = useCheckOut();

  const data = dashboardQuery.data;
  const todayAttendance = data?.today_attendance ?? null;
  const checkIn = todayAttendance?.check_in ?? null;
  const checkOut = todayAttendance?.check_out ?? null;
  const settings = policyQuery.data?.company_settings;

  const recentRequests = useMemo(
    () =>
      [...(data?.recent_requests ?? [])]
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .slice(0, DASHBOARD_RECENT_REQUEST_COUNT),
    [data]
  );

  const checkInNow = () =>
    checkInMutation.mutate(undefined, {
      onSuccess: () => toast.success(CHECK_IN_SUCCESS),
      onError: (error) =>
        toast.error(
          toErrorMessage(error, CHECK_IN_FAILED, ATTENDANCE_ERROR_MESSAGE)
        ),
    });

  const checkOutNow = () =>
    checkOutMutation.mutate(undefined, {
      onSuccess: () => toast.success(CHECK_OUT_SUCCESS),
      onError: (error) =>
        toast.error(
          toErrorMessage(error, CHECK_OUT_FAILED, ATTENDANCE_ERROR_MESSAGE)
        ),
    });

  return {
    checkIn,
    checkOut,
    isLate: todayAttendance?.status === "late",
    workStatus: getWorkStatus(checkIn, checkOut),
    workHoursLabel: formatWorkHours(
      settings?.work_start_time ?? DEFAULT_WORK_START_TIME,
      settings?.work_end_time ?? DEFAULT_WORK_END_TIME
    ),
    balance: data?.balance ?? null,
    recentRequests,
    processing: checkInMutation.isPending || checkOutMutation.isPending,
    isLoading: dashboardQuery.isLoading,
    isError: dashboardQuery.isError,
    checkInNow,
    checkOutNow,
  };
};
