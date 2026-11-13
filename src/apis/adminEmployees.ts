import type { AdminEmployeeBalancesResponse } from "../models/apis/admin";
import { apiRequest } from "./apiRequest";
import { API_PATHS } from "./paths";

export const getAdminEmployeeBalances = async (params?: {
  year?: number;
  search?: string;
  department?: string;
  page?: number;
  page_size?: number;
}): Promise<AdminEmployeeBalancesResponse> => {
  const { data } = await apiRequest.get<AdminEmployeeBalancesResponse>(
    API_PATHS.adminEmployeeBalances,
    { params }
  );
  return data;
};
