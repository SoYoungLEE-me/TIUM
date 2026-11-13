import { supabase } from "../libs/supabaseClient";
import type { AdminEmployeeBalancesResponse } from "../models/apis/admin";
import { ApiRequestError } from "../models/apis/common";
import type { Employee } from "../models/apis/employees";
import { toBalance } from "./leaves";

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
    const balanceResult = await supabase
      .from("leave_balances")
      .select("employee_id, year, total_days, used_days")
      .eq("year", year)
      .in("employee_id", ids);

    if (balanceResult.error) {
      throw new ApiRequestError({
        code: balanceResult.error.code ?? "SUPABASE_ERROR",
        message: balanceResult.error.message,
        details: {},
      });
    }

    balanceMap = new Map(
      (balanceResult.data ?? []).map((row) => [
        row.employee_id as string,
        toBalance({
          year: row.year as number,
          total_days: row.total_days as number,
          used_days: row.used_days as number,
        }),
      ])
    );
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
