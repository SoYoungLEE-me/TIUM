import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getLeaveBalance,
  getLeaveRequest,
  getMyLeaveRequests,
  submitLeave,
  submitLeaveFromToken,
} from "../../apis/leaves";
import type { LeaveInput } from "../../models/apis/leave";
import { queryKeys } from "./queryKeys";

export const useLeaveBalance = (year?: number) =>
  useQuery({
    queryKey: queryKeys.leaveBalance(year),
    queryFn: () => getLeaveBalance(year !== undefined ? { year } : undefined),
  });

export const useMyLeaveRequests = (filters?: {
  start_date?: string;
  end_date?: string;
  page?: number;
  page_size?: number;
}) =>
  useQuery({
    queryKey: queryKeys.leaveRequests(filters),
    queryFn: () => getMyLeaveRequests(filters),
  });

export const useLeaveRequest = (requestId: string, enabled = true) =>
  useQuery({
    queryKey: queryKeys.leaveRequest(requestId),
    queryFn: () => getLeaveRequest(requestId),
    enabled: Boolean(requestId) && enabled,
  });

export const useSubmitLeave = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: LeaveInput) => submitLeave(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["leaveBalance"] });
      void queryClient.invalidateQueries({ queryKey: ["leaveRequests"] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
};

export const useSubmitLeaveFromToken = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      confirmation_token: string;
      submission_key: string;
    }) => submitLeaveFromToken(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["leaveBalance"] });
      void queryClient.invalidateQueries({ queryKey: ["leaveRequests"] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
};
