import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createApprovalRule,
  getAdminSettings,
  updateAdminSettings,
  updateApprovalRule,
  updateLeaveType,
  type CreateApprovalRuleInput,
  type UpdateApprovalRuleInput,
  type UpdateLeaveTypeInput,
} from "../../apis/adminSettings";
import type { SettingsUpdate } from "../../models/apis/settings";
import { queryKeys } from "./queryKeys";

const invalidateSettings = (queryClient: ReturnType<typeof useQueryClient>) => {
  void queryClient.invalidateQueries({ queryKey: queryKeys.adminSettings });
  void queryClient.invalidateQueries({ queryKey: queryKeys.companyPolicy });
};

export const useAdminSettingsQuery = () =>
  useQuery({
    queryKey: queryKeys.adminSettings,
    queryFn: getAdminSettings,
  });

export const useUpdateAdminSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: SettingsUpdate) => updateAdminSettings(body),
    onSuccess: () => invalidateSettings(queryClient),
  });
};

export const useCreateApprovalRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateApprovalRuleInput) => createApprovalRule(body),
    onSuccess: () => invalidateSettings(queryClient),
  });
};

export const useUpdateApprovalRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateApprovalRuleInput) => updateApprovalRule(body),
    onSuccess: () => invalidateSettings(queryClient),
  });
};

export const useUpdateLeaveType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateLeaveTypeInput) => updateLeaveType(body),
    onSuccess: () => invalidateSettings(queryClient),
  });
};
