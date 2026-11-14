import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  checkIn,
  checkOut,
  getAttendanceRecords,
  monthToDateRange,
} from "../../apis/attendance";
import { queryKeys } from "./queryKeys";

export const useAttendanceRecords = (
  month?: string,
  employeeId?: string | null,
) =>
  useQuery({
    queryKey: [...queryKeys.attendance(month), employeeId ?? "self"],
    queryFn: () => {
      if (!month) {
        throw new Error("month is required (YYYY-MM)");
      }
      const { startDate, endDate } = monthToDateRange(month);
      return getAttendanceRecords({ startDate, endDate, employeeId });
    },
    enabled: Boolean(month),
  });

/** @deprecated use useAttendanceRecords — rpc는 캘린더 합성이 아닌 records만 반환 */
export const useAttendanceCalendar = useAttendanceRecords;

export const useCheckIn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: checkIn,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["attendance"] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
};

export const useCheckOut = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: checkOut,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["attendance"] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
};
