import { supabase } from "../libs/supabaseClient";
import type { GrantInput } from "../models/apis/admin";
import { ApiRequestError } from "../models/apis/common";
import type { Balance } from "../models/apis/leave";
import { unwrap } from "./apiRequest";
import { getLeaveBalanceForEmployee } from "./leaves";

/**
 * grant RPC 없음 — HR RLS로 leave_balances.total_days 증가 + 거래 이력 기록.
 * submission_key 는 BE 필드 없음 → 무시. reason 은 거래 테이블에 없어 미저장.
 */
export const grantLeave = async (body: GrantInput): Promise<Balance> => {
  void body.reason;
  void body.submission_key;

  const { employee_id, year, days } = body;
  if (!employee_id || !year || !(days > 0)) {
    throw new ApiRequestError({
      code: "VALIDATION_ERROR",
      message: "employee_id, year, and a positive days value are required.",
      details: {},
    });
  }

  const existing = await unwrap(
    supabase
      .from("leave_balances")
      .select("id, total_days, used_days")
      .eq("employee_id", employee_id)
      .eq("year", year)
      .maybeSingle()
  );

  let balanceId: string;

  if (!existing) {
    const created = await unwrap(
      supabase
        .from("leave_balances")
        .insert({
          employee_id,
          year,
          total_days: days,
          used_days: 0,
        })
        .select("id")
        .single()
    );
    if (!created?.id) {
      throw new ApiRequestError({
        code: "SUPABASE_ERROR",
        message: "Failed to create leave balance.",
        details: {},
      });
    }
    balanceId = created.id as string;
  } else {
    balanceId = existing.id as string;
    const nextTotal = Number(existing.total_days) + days;
    await unwrap(
      supabase
        .from("leave_balances")
        .update({
          total_days: nextTotal,
          updated_at: new Date().toISOString(),
        })
        .eq("id", balanceId)
        .select("id")
        .single()
    );
  }

  await unwrap(
    supabase.from("leave_balance_transactions").insert({
      leave_balance_id: balanceId,
      leave_request_id: null,
      transaction_type: "grant",
      amount: days,
    })
  );

  return getLeaveBalanceForEmployee(employee_id, year);
};
