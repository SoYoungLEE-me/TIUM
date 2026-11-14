import { supabase } from "../libs/supabaseClient";
import { ApiRequestError } from "../models/apis/common";
import type {
  Balance,
  LeaveInput,
  LeaveRequest,
} from "../models/apis/leave";
import { rpc, unwrap } from "./apiRequest";
import { getMe } from "./me";

type LeaveBalanceRow = {
  year: number;
  total_days: number | string;
  used_days: number | string;
};

export const toBalance = (
  row: LeaveBalanceRow,
  pendingDays = 0
): Balance => {
  const total_days = Number(row.total_days);
  const used_days = Number(row.used_days);
  const remaining_days = total_days - used_days;
  const pending_days = pendingDays;
  const available_days = remaining_days - pending_days;

  return {
    year: row.year,
    total_days,
    used_days,
    remaining_days,
    pending_days,
    available_days,
  };
};

const currentYearSeoul = () =>
  Number(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Seoul",
      year: "numeric",
    }).format(new Date())
  );

const sumPendingDays = async (
  employeeId: string,
  year: number
): Promise<number> => {
  const rows = await unwrap(
    supabase
      .from("leave_requests")
      .select("total_days")
      .eq("employee_id", employeeId)
      .eq("status", "pending")
      .gte("start_date", `${year}-01-01`)
      .lte("start_date", `${year}-12-31`)
  );

  return (rows ?? []).reduce(
    (sum, row) => sum + Number(row.total_days),
    0
  );
};

export const getLeaveBalanceForEmployee = async (
  employeeId: string,
  year?: number
): Promise<Balance> => {
  const targetYear = year ?? currentYearSeoul();

  const row = await unwrap(
    supabase
      .from("leave_balances")
      .select("year, total_days, used_days")
      .eq("employee_id", employeeId)
      .eq("year", targetYear)
      .maybeSingle()
  );

  if (!row) {
    return toBalance(
      { year: targetYear, total_days: 0, used_days: 0 },
      0
    );
  }

  const pendingDays = await sumPendingDays(employeeId, targetYear);
  return toBalance(row, pendingDays);
};

export const getLeaveBalance = async (params?: {
  year?: number;
}): Promise<Balance> => {
  const me = await getMe();
  return getLeaveBalanceForEmployee(me.id, params?.year);
};

export const getMyLeaveRequests = async (params?: {
  start_date?: string;
  end_date?: string;
  page?: number;
  page_size?: number;
}): Promise<LeaveRequest[]> => {
  const me = await getMe();
  const page = params?.page ?? 1;
  const pageSize = params?.page_size ?? 50;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("leave_requests")
    .select(
      "id, employee_id, leave_type_id, start_date, end_date, total_days, reason, status, approval_type, decision_reason, reviewed_by, reviewed_at, created_at, leave_types(name)"
    )
    .eq("employee_id", me.id)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (params?.start_date) {
    query = query.gte("start_date", params.start_date);
  }
  if (params?.end_date) {
    query = query.lte("end_date", params.end_date);
  }

  const rows = await unwrap(query);

  return (rows ?? []).map((row) => {
    const { leave_types: leaveType, ...request } = row as typeof row & {
      leave_types?: { name: string } | null;
    };
    return {
      ...(request as LeaveRequest),
      total_days: Number(request.total_days),
      leave_type_name: leaveType?.name,
    };
  });
};

export const getLeaveRequest = async (
  requestId: string
): Promise<LeaveRequest> => {
  const row = await unwrap(
    supabase
      .from("leave_requests")
      .select(
        "id, employee_id, leave_type_id, start_date, end_date, total_days, reason, status, approval_type, decision_reason, reviewed_by, reviewed_at, created_at, leave_types(name)"
      )
      .eq("id", requestId)
      .maybeSingle()
  );

  if (!row) {
    throw new ApiRequestError({
      code: "NOT_FOUND",
      message: "Leave request not found.",
      details: {},
    });
  }

  const { leave_types: leaveType, ...request } = row as typeof row & {
    leave_types?: { name: string } | null;
  };

  return {
    ...(request as LeaveRequest),
    total_days: Number(request.total_days),
    leave_type_name: leaveType?.name,
  };
};

/** apply_leave RPC — OpenAPI confirmation_token 흐름 대신 직접 신청 */
export const submitLeave = async (
  body: LeaveInput
): Promise<LeaveRequest> => {
  const data = await rpc<LeaveRequest>("apply_leave", {
    p_leave_type_id: body.leave_type_id,
    p_start_date: body.start_date,
    p_end_date: body.end_date,
    p_reason: body.reason ?? null,
  });

  return {
    ...data,
    total_days: Number(data.total_days),
  };
};
