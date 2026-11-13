import type { DataResponse } from "../models/apis/common";
import type { GrantInput } from "../models/apis/admin";
import type { Balance } from "../models/apis/leave";
import { apiRequest } from "./apiRequest";
import { API_PATHS } from "./paths";

export const grantLeave = async (body: GrantInput): Promise<Balance> => {
  const { data } = await apiRequest.post<DataResponse<Balance>>(
    API_PATHS.adminLeaveGrants,
    body
  );
  return data.data;
};
