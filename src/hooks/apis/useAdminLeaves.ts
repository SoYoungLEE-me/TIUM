import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  approveAdminLeave,
  cancelAdminLeave,
  getAdminLeave,
  getAdminLeaves,
  rejectAdminLeave,
} from "../../apis/adminLeaves";
import type { DecisionInput } from "../../models/apis/admin";
import { queryKeys } from "./queryKeys";

export const useAdminLeaves = (
  filters?: {
    status?: string;
    search?: string;
    department?: string;
    page?: number;
    page_size?: number;
  },
  options?: { enabled?: boolean }
) =>
  useQuery({
    queryKey: queryKeys.adminLeaves(filters),
    queryFn: () => getAdminLeaves(filters),
    enabled: options?.enabled ?? true,
  });

export const useAdminLeave = (requestId: string, enabled = true) =>
  useQuery({
    queryKey: queryKeys.adminLeave(requestId),
    queryFn: () => getAdminLeave(requestId),
    enabled: Boolean(requestId) && enabled,
  });

export const useApproveAdminLeave = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) => approveAdminLeave(requestId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["adminLeaves"] });
      void queryClient.invalidateQueries({ queryKey: ["adminLeave"] });
    },
  });
};

export const useRejectAdminLeave = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      requestId,
      body,
    }: {
      requestId: string;
      body?: DecisionInput;
    }) => rejectAdminLeave(requestId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["adminLeaves"] });
      void queryClient.invalidateQueries({ queryKey: ["adminLeave"] });
    },
  });
};

export const useCancelAdminLeave = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) => cancelAdminLeave(requestId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["adminLeaves"] });
      void queryClient.invalidateQueries({ queryKey: ["adminLeave"] });
    },
  });
};
