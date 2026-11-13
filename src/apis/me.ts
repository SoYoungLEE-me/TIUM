import type { DataResponse } from "../models/apis/common";
import type { Employee } from "../models/apis/employee";
import { apiRequest } from "./apiRequest";
import { API_PATHS } from "./paths";

export const getMe = async (): Promise<Employee> => {
  const { data } = await apiRequest.get<DataResponse<Employee>>(API_PATHS.me);
  return data.data;
};
