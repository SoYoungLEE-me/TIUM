import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAdminEmployeeBalances } from "../../apis/adminEmployees";
import { grantLeave } from "../../apis/adminLeaveGrants";
import type { GrantInput } from "../../models/apis/admin";
import { queryKeys } from "./queryKeys";

export const useAdminEmployeeBalances = (filters?: {
  year?: number;
  search?: string;
  department?: string;
  page?: number;
  page_size?: number;
}) =>
  useQuery({
    queryKey: queryKeys.adminEmployeeBalances(filters),
    queryFn: () => getAdminEmployeeBalances(filters),
  });

export const useGrantLeave = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: GrantInput) => grantLeave(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["adminEmployeeBalances"],
      });
    },
  });
};
