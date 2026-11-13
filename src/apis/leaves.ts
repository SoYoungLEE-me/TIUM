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
import { supabase } from "../libs/supabase";

export const getLeaveBalance = async (params?: {
  year?: number;
}): Promise<Balance> => {
  // 1. 조회할 연도 설정
  const year = params?.year ?? new Date().getFullYear();

  // 2. 현재 로그인한 사용자 확인
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw authError;
  }

  if (!user) {
    throw new Error("User is not authenticated.");
  }

  // 3. 해당 연도의 연차 잔액 조회
  const { data: balance, error: balanceError } = await supabase
    .from("leave_balances")
    .select("total_days, used_days")
    .eq("employee_id", user.id)
    .eq("year", year)
    .maybeSingle();

  if (balanceError) {
    throw balanceError;
  }

  if (!balance) {
    throw new Error("Leave balance not found.");
  }

  // 4. 해당 연도의 검토 대기 중인 휴가 신청 조회
  const { data: pendingRequests, error: pendingError } = await supabase
    .from("leave_requests")
    .select("total_days")
    .eq("employee_id", user.id)
    .eq("status", "pending")
    .gte("start_date", `${year}-01-01`)
    .lt("start_date", `${year + 1}-01-01`);

  if (pendingError) {
    throw pendingError;
  }

  // 5. 검토 대기 일수 합산
  const pendingDays = Number(
    (pendingRequests ?? [])
      .reduce((sum, request) => sum + Number(request.total_days), 0)
      .toFixed(2)
  );

  // 6. 잔여 일수 및 신청 가능 일수 계산
  const totalDays = Number(balance.total_days);
  const usedDays = Number(balance.used_days);

  const remainingDays = Number((totalDays - usedDays).toFixed(2));
  const availableDays = Number(
    (remainingDays - pendingDays).toFixed(2)
  );

  return {
    year,
    total_days: totalDays,
    used_days: usedDays,
    remaining_days: remainingDays,
    pending_days: pendingDays,
    available_days: availableDays,
  };
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
