import type { DataResponse } from "../models/apis/common";
import type { SettingsBundle, SettingsUpdate } from "../models/apis/settings";
import { apiRequest } from "./apiRequest";
import { API_PATHS } from "./paths";

export const getAdminSettings = async (): Promise<SettingsBundle> => {
  const { data } = await apiRequest.get<DataResponse<SettingsBundle>>(
    API_PATHS.adminSettings
  );
  return data.data;
};

export const updateAdminSettings = async (
  body: SettingsUpdate
): Promise<SettingsBundle> => {
  const { data } = await apiRequest.patch<DataResponse<SettingsBundle>>(
    API_PATHS.adminSettings,
    body
  );
  return data.data;
};
