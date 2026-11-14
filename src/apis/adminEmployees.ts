import { supabase } from "../libs/supabaseClient";
import type { AdminEmployeeBalancesResponse } from "../models/apis/admin";
import type {
  EmployeeLeaveHistoryItem,
  EmployeeLeaveRequestBrief,
} from "../models/admin/leaves";
import type { LeaveRequestStatus } from "../models/admin/admin";
import { ApiRequestError } from "../models/apis/common";
import type { Employee } from "../models/apis/employees";
import { invokeFunction, unwrap } from "./apiRequest";
import { toBalance } from "./leaves";

const TX_CATEGORY: Record<string, string> = {
  grant: "부여",
  deduction: "차감",
  restoration: "복구",
};

export type AdminEmployeeLeaveDetail = {
  requests: EmployeeLeaveRequestBrief[];
  history: EmployeeLeaveHistoryItem[];
};

export type CreateEmployeeInput = {
  full_name: string;
  email: string;
  department?: string | null;
};

export type UpdateEmployeeProfileInput = {
  employee_id: string;
  full_name?: string;
  email?: string;
  department?: string | null;
};

type EmployeeEdgeResponse = {
  message?: string;
  data?: Employee;
  employee?: Employee;
  error?: string;
};

export const createEmployee = async (
  input: CreateEmployeeInput
): Promise<Employee> => {
  const result = await invokeFunction<EmployeeEdgeResponse>("create-employee", {
    full_name: input.full_name,
    email: input.email,
    department: input.department ?? null,
  });

  const employee = result.data ?? result.employee;
  if (!employee) {
    throw new ApiRequestError({
      code: "FUNCTION_ERROR",
      message: result.error ?? "Failed to create employee.",
      details: {},
    });
  }
  return employee;
};

export const updateEmployeeProfile = async (
  input: UpdateEmployeeProfileInput
): Promise<Employee> => {
  const body: Record<string, unknown> = {
    employee_id: input.employee_id,
  };
  if (input.full_name !== undefined) body.full_name = input.full_name;
  if (input.email !== undefined) body.email = input.email;
  if (input.department !== undefined) body.department = input.department;

  const result = await invokeFunction<EmployeeEdgeResponse>(
    "update-employee-profile",
    body
  );

  const employee = result.data ?? result.employee;
  if (!employee) {
    throw new ApiRequestError({
      code: "FUNCTION_ERROR",
      message: result.error ?? "Failed to update employee profile.",
      details: {},
    });
  }
  return employee;
};

const currentYearSeoul = () =>
  Number(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Seoul",
      year: "numeric",
    }).format(new Date())
  );

export const getAdminEmployeeBalances = async (params?: {
  year?: number;
  search?: string;
  department?: string;
  page?: number;
  page_size?: number;
}): Promise<AdminEmployeeBalancesResponse> => {
  const year = params?.year ?? currentYearSeoul();
  const page = params?.page ?? 1;
  const pageSize = params?.page_size ?? 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("employees")
    .select("id, full_name, email, role, department, created_at", {
      count: "exact",
    })
    .order("full_name", { ascending: true })
    .range(from, to);

  if (params?.department) {
    query = query.eq("department", params.department);
  }
  if (params?.search?.trim()) {
    const q = params.search.trim();
    query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%`);
  }

  const { data, error, count } = await query;
  if (error) {
    throw new ApiRequestError({
      code: error.code ?? "SUPABASE_ERROR",
      message: error.message,
      details: {},
    });
  }

  const employees = (data ?? []) as Employee[];
  const ids = employees.map((e) => e.id);

  let balanceMap = new Map<string, ReturnType<typeof toBalance>>();

  if (ids.length > 0) {
    const [balanceResult, pendingResult] = await Promise.all([
      supabase
        .from("leave_balances")
        .select("employee_id, year, total_days, used_days")
        .eq("year", year)
        .in("employee_id", ids),
      supabase
        .from("leave_requests")
        .select("employee_id, total_days")
        .eq("status", "pending")
        .in("employee_id", ids)
        .gte("start_date", `${year}-01-01`)
        .lte("start_date", `${year}-12-31`),
    ]);

    if (balanceResult.error) {
      throw new ApiRequestError({
        code: balanceResult.error.code ?? "SUPABASE_ERROR",
        message: balanceResult.error.message,
        details: {},
      });
    }
    if (pendingResult.error) {
      throw new ApiRequestError({
        code: pendingResult.error.code ?? "SUPABASE_ERROR",
        message: pendingResult.error.message,
        details: {},
      });
    }

    const pendingByEmployee = new Map<string, number>();
    for (const row of pendingResult.data ?? []) {
      const employeeId = row.employee_id as string;
      const days = Number(row.total_days) || 0;
      pendingByEmployee.set(
        employeeId,
        (pendingByEmployee.get(employeeId) ?? 0) + days
      );
    }

    balanceMap = new Map(
      (balanceResult.data ?? []).map((row) => {
        const employeeId = row.employee_id as string;
        return [
          employeeId,
          toBalance(
            {
              year: row.year as number,
              total_days: row.total_days as number,
              used_days: row.used_days as number,
            },
            pendingByEmployee.get(employeeId) ?? 0
          ),
        ];
      })
    );

    // 잔액 행이 없어도 pending만 있는 직원용 스냅샷
    for (const employeeId of ids) {
      if (balanceMap.has(employeeId)) continue;
      const pendingDays = pendingByEmployee.get(employeeId) ?? 0;
      if (pendingDays <= 0) continue;
      balanceMap.set(
        employeeId,
        toBalance({ year, total_days: 0, used_days: 0 }, pendingDays)
      );
    }
  }

  const total = count ?? employees.length;

  return {
    data: employees.map((employee) => ({
      employee,
      balance: balanceMap.get(employee.id) ?? null,
    })),
    pagination: {
      page,
      page_size: pageSize,
      total,
      total_pages: Math.max(1, Math.ceil(total / pageSize)),
    },
  };
};

/** 직원 상세: 해당 연도 신청 내역 + 잔액 변동 이력 */
export const getAdminEmployeeLeaveDetail = async (
  employeeId: string,
  year: number
): Promise<AdminEmployeeLeaveDetail> => {
  const [requestsResult, balanceResult] = await Promise.all([
    unwrap(
      supabase
        .from("leave_requests")
        .select(
          "id, start_date, end_date, total_days, status, leave_types(name)"
        )
        .eq("employee_id", employeeId)
        .gte("start_date", `${year}-01-01`)
        .lte("start_date", `${year}-12-31`)
        .order("created_at", { ascending: false })
    ),
    unwrap(
      supabase
        .from("leave_balances")
        .select("id")
        .eq("employee_id", employeeId)
        .eq("year", year)
        .maybeSingle()
    ),
  ]);

  const requests: EmployeeLeaveRequestBrief[] = (requestsResult ?? []).map(
    (row) => {
      const leaveTypes = row.leave_types as
        | { name?: string }
        | { name?: string }[]
        | null;
      const typeName = Array.isArray(leaveTypes)
        ? leaveTypes[0]?.name
        : leaveTypes?.name;

      return {
        id: row.id as string,
        leave_type_name: typeName ?? "-",
        start_date: row.start_date as string,
        end_date: row.end_date as string,
        total_days: Number(row.total_days) || 0,
        status: row.status as LeaveRequestStatus,
      };
    }
  );

  let history: EmployeeLeaveHistoryItem[] = [];
  const balanceId = balanceResult?.id as string | undefined;

  if (balanceId) {
    const txRows = await unwrap(
      supabase
        .from("leave_balance_transactions")
        .select(
          "id, transaction_type, amount, created_at, leave_request_id, leave_requests(reason)"
        )
        .eq("leave_balance_id", balanceId)
        .order("created_at", { ascending: false })
    );

    history = (txRows ?? []).map((row) => {
      const type = row.transaction_type as string;
      const linked = row.leave_requests as
        | { reason?: string | null }
        | { reason?: string | null }[]
        | null;
      const linkedReason = Array.isArray(linked)
        ? linked[0]?.reason
        : linked?.reason;

      return {
        id: row.id as string,
        category: TX_CATEGORY[type] ?? type,
        change_days: Number(row.amount) || 0,
        reason:
          linkedReason?.trim() ||
          (type === "grant"
            ? "연차 부여"
            : type === "deduction"
              ? "연차 사용"
              : type === "restoration"
                ? "연차 복구"
                : "-"),
        processed_at: row.created_at as string,
      };
    });
  }

  return { requests, history };
};
