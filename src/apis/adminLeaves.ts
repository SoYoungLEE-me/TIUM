import type { DataResponse } from "../models/apis/common";
import type {
  AdminLeaveDetail,
  AdminLeaveListResponse,
  DecisionInput,
} from "../models/apis/admin";
import type { LeaveRequest } from "../models/apis/leave";
import { apiRequest } from "./apiRequest";
import { API_PATHS } from "./paths";

export const getAdminLeaves = async (params?: {
  status?: string;
  search?: string;
  department?: string;
  page?: number;
  page_size?: number;
}): Promise<AdminLeaveListResponse> => {
  const { data } = await apiRequest.get<AdminLeaveListResponse>(
    API_PATHS.adminLeaves,
    { params }
  );
  return data;
};

export const getAdminLeave = async (
  requestId: string
): Promise<AdminLeaveDetail> => {
  const { data } = await apiRequest.get<DataResponse<AdminLeaveDetail>>(
    API_PATHS.adminLeaveById(requestId)
  );
  return data.data;
};

export const approveAdminLeave = async (
  requestId: string,
  body: DecisionInput
): Promise<LeaveRequest> => {
  const { data } = await apiRequest.post<DataResponse<LeaveRequest>>(
    API_PATHS.adminLeaveApprove(requestId),
    body
  );
  return data.data;
};

export const rejectAdminLeave = async (
  requestId: string,
  body: DecisionInput
): Promise<LeaveRequest> => {
  const { data } = await apiRequest.post<DataResponse<LeaveRequest>>(
    API_PATHS.adminLeaveReject(requestId),
    body
  );
  return data.data;
};
