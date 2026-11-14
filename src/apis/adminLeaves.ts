import { supabase } from "../libs/supabaseClient";
import type {
  AdminLeaveDetail,
  AdminLeaveListItem,
  AdminLeaveListResponse,
  DecisionInput,
} from "../models/apis/admin";
import { ApiRequestError } from "../models/apis/common";
import type { Employee } from "../models/apis/employees";
import type { LeaveRequest } from "../models/apis/leave";
import { rpc, unwrap } from "./apiRequest";
import { getLeaveBalanceForEmployee } from "./leaves";

const LEAVE_SELECT =
  "id, employee_id, leave_type_id, start_date, end_date, total_days, reason, status, approval_type, decision_reason, reviewed_by, reviewed_at, created_at, leave_types(name), employees!leave_requests_employee_id_fkey(id, full_name, email, role, department, created_at)";

const mapLeaveRequest = (row: Record<string, unknown>): LeaveRequest => {
  const leaveType = row.leave_types as { name: string } | null | undefined;
  return {
    id: row.id as string,
    employee_id: row.employee_id as string,
    leave_type_id: row.leave_type_id as string,
    leave_type_name: leaveType?.name,
    start_date: row.start_date as string,
    end_date: row.end_date as string,
    total_days: Number(row.total_days),
    reason: (row.reason as string | null) ?? null,
    status: row.status as LeaveRequest["status"],
    approval_type: (row.approval_type as LeaveRequest["approval_type"]) ?? null,
    decision_reason: (row.decision_reason as string | null) ?? null,
    reviewed_by: (row.reviewed_by as string | null) ?? null,
    reviewed_at: (row.reviewed_at as string | null) ?? null,
    created_at: row.created_at as string,
  };
};

const mapEmployee = (row: Record<string, unknown> | null): Employee => {
  if (!row) {
    throw new ApiRequestError({
      code: "NOT_FOUND",
      message: "Employee not found for leave request.",
      details: {},
    });
  }
  return {
    id: row.id as string,
    full_name: row.full_name as string,
    email: row.email as string,
    role: row.role as Employee["role"],
    department: (row.department as string | null) ?? null,
    created_at: row.created_at as string,
  };
};

export const getAdminLeaves = async (params?: {
  status?: string;
  search?: string;
  department?: string;
  page?: number;
  page_size?: number;
}): Promise<AdminLeaveListResponse> => {
  const page = params?.page ?? 1;
  const pageSize = params?.page_size ?? 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("leave_requests")
    .select(LEAVE_SELECT, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (params?.status) {
    query = query.eq("status", params.status);
  }
  if (params?.department) {
    query = query.eq(
      "employees.department",
      params.department
    );
  }

  const { data, error, count } = await query;
  if (error) {
    throw new ApiRequestError({
      code: error.code ?? "SUPABASE_ERROR",
      message: error.message,
      details: {},
    });
  }

  let items: AdminLeaveListItem[] = (data ?? []).map((row) => {
    const record = row as Record<string, unknown>;
    return {
      request: mapLeaveRequest(record),
      employee: mapEmployee(
        record.employees as Record<string, unknown> | null
      ),
    };
  });

  if (params?.search?.trim()) {
    const q = params.search.trim().toLowerCase();
    items = items.filter(
      (item) =>
        item.employee.full_name.toLowerCase().includes(q) ||
        item.employee.email.toLowerCase().includes(q)
    );
  }

  const total = count ?? items.length;
  return {
    data: items,
    pagination: {
      page,
      page_size: pageSize,
      total,
      total_pages: Math.max(1, Math.ceil(total / pageSize)),
    },
  };
};

export const getAdminLeave = async (
  requestId: string
): Promise<AdminLeaveDetail> => {
  const row = await unwrap(
    supabase.from("leave_requests").select(LEAVE_SELECT).eq("id", requestId).maybeSingle()
  );

  if (!row) {
    throw new ApiRequestError({
      code: "NOT_FOUND",
      message: "Leave request not found.",
      details: {},
    });
  }

  const record = row as Record<string, unknown>;
  const request = mapLeaveRequest(record);
  const employee = mapEmployee(
    record.employees as Record<string, unknown> | null
  );
  const year = Number(request.start_date.slice(0, 4));
  const balance = await getLeaveBalanceForEmployee(request.employee_id, year);

  const attendance_conflicts = await unwrap(
    supabase
      .from("attendance_records")
      .select("id, employee_id, work_date, check_in, check_out, status")
      .eq("employee_id", request.employee_id)
      .gte("work_date", request.start_date)
      .lte("work_date", request.end_date)
  );

  return {
    request,
    employee,
    balance,
    attendance_conflicts: attendance_conflicts ?? [],
  };
};

export const approveAdminLeave = async (
  requestId: string
): Promise<LeaveRequest> => {
  const data = await rpc<LeaveRequest>("approve_leave", {
    p_leave_request_id: requestId,
  });
  return { ...data, total_days: Number(data.total_days) };
};

export const rejectAdminLeave = async (
  requestId: string,
  body?: DecisionInput
): Promise<LeaveRequest> => {
  const data = await rpc<LeaveRequest>("reject_leave", {
    p_leave_request_id: requestId,
    p_decision_reason: body?.reason || null,
  });
  return { ...data, total_days: Number(data.total_days) };
};

/** HR UPDATE RLS — pending만 cancelled로 변경 */
export const cancelAdminLeave = async (
  requestId: string
): Promise<LeaveRequest> => {
  const existing = await unwrap(
    supabase
      .from("leave_requests")
      .select(LEAVE_SELECT)
      .eq("id", requestId)
      .maybeSingle()
  );

  if (!existing) {
    throw new ApiRequestError({
      code: "NOT_FOUND",
      message: "Leave request not found.",
      details: {},
    });
  }

  const current = mapLeaveRequest(existing as Record<string, unknown>);
  if (current.status !== "pending") {
    throw new ApiRequestError({
      code: "INVALID_STATUS",
      message: "Only pending leave requests can be cancelled.",
      details: { status: current.status },
    });
  }

  const updated = await unwrap(
    supabase
      .from("leave_requests")
      .update({ status: "cancelled" })
      .eq("id", requestId)
      .eq("status", "pending")
      .select(LEAVE_SELECT)
      .maybeSingle()
  );

  if (!updated) {
    throw new ApiRequestError({
      code: "CONFLICT",
      message: "Leave request could not be cancelled.",
      details: {},
    });
  }

  return mapLeaveRequest(updated as Record<string, unknown>);
};
