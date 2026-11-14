import { supabase } from "../libs/supabaseClient";
import type { AdminEmployeeBalancesResponse } from "../models/apis/admin";
import { ApiRequestError } from "../models/apis/common";
import type { Employee } from "../models/apis/employees";
import { invokeFunction } from "./apiRequest";
import { toBalance } from "./leaves";

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
