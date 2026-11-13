import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAdminSettings,
  updateAdminSettings,
} from "../../apis/adminSettings";
import type { SettingsUpdate } from "../../models/apis/settings";
import { queryKeys } from "./queryKeys";

export const useAdminSettingsQuery = () =>
  useQuery({
    queryKey: queryKeys.adminSettings,
    queryFn: getAdminSettings,
  });

export const useUpdateAdminSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: SettingsUpdate) => updateAdminSettings(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminSettings });
      void queryClient.invalidateQueries({ queryKey: queryKeys.companyPolicy });
    },
  });
};
