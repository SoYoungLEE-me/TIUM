import type { DataResponse } from "../models/apis/common";
import type {
  Balance,
  LeaveInput,
  LeavePreview,
  LeaveRequest,
  SubmitLeaveRequest,
  SubmittedLeave,
} from "../models/apis/leave";
import { apiRequest } from "./apiRequest";
import { API_PATHS } from "./paths";

export const getLeaveBalance = async (params?: {
  year?: number;
}): Promise<Balance> => {
  const { data } = await apiRequest.get<DataResponse<Balance>>(
    API_PATHS.leavesBalance,
    { params }
  );
  return data.data;
};

export const getMyLeaveRequests = async (params?: {
  start_date?: string;
  end_date?: string;
  page?: number;
  page_size?: number;
}): Promise<LeaveRequest[]> => {
  const { data } = await apiRequest.get<{ data: LeaveRequest[] }>(
    API_PATHS.leaves,
    { params }
  );
  return data.data;
};

export const getLeaveRequest = async (
  requestId: string
): Promise<LeaveRequest> => {
  const { data } = await apiRequest.get<DataResponse<LeaveRequest>>(
    API_PATHS.leaveById(requestId)
  );
  return data.data;
};

export const validateLeave = async (
  body: LeaveInput
): Promise<LeavePreview> => {
  const { data } = await apiRequest.post<DataResponse<LeavePreview>>(
    API_PATHS.leavesValidate,
    body
  );
  return data.data;
};

export const submitLeave = async (
  body: SubmitLeaveRequest
): Promise<SubmittedLeave> => {
  const { data } = await apiRequest.post<DataResponse<SubmittedLeave>>(
    API_PATHS.leaves,
    body
  );
  return data.data;
};
