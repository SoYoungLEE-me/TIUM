import type { DataResponse } from "../models/apis/common";
import type { SettingsBundle } from "../models/apis/settings";
import { apiRequest } from "./apiRequest";
import { API_PATHS } from "./paths";

export const getCompanyPolicy = async (): Promise<SettingsBundle> => {
  const { data } = await apiRequest.get<DataResponse<SettingsBundle>>(
    API_PATHS.companyPolicy
  );
  return data.data;
};
