import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  checkIn,
  checkOut,
  getAttendanceCalendar,
} from "../../apis/attendance";
import { queryKeys } from "./queryKeys";

export const useAttendanceCalendar = (month?: string) =>
  useQuery({
    queryKey: queryKeys.attendance(month),
    queryFn: () => getAttendanceCalendar(month ? { month } : undefined),
  });

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
