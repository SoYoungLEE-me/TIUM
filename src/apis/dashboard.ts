import type { DataResponse } from "../models/apis/common";
import type { DashboardData } from "../models/apis/dashboard";
import { apiRequest } from "./apiRequest";
import { API_PATHS } from "./paths";

export const getDashboard = async (): Promise<DashboardData> => {
  const { data } = await apiRequest.get<DataResponse<DashboardData>>(
    API_PATHS.dashboard
  );
  return data.data;
};
