import { supabase } from "../libs/supabaseClient";
import { ApiRequestError } from "../models/apis/common";
import type {
  ApprovalRule,
  LeaveType,
  Settings,
  SettingsBundle,
} from "../models/apis/settings";
import { unwrap } from "./apiRequest";

const formatTime = (value: string) =>
  value.length >= 5 ? value.slice(0, 5) : value;

const mapCompanySettings = (row: {
  id: boolean;
  work_start_time: string;
  work_end_time: string;
  late_threshold: number;
  auto_approval_enabled: boolean;
  updated_at: string;
}): Settings => ({
  id: true,
  work_start_time: formatTime(String(row.work_start_time)),
  work_end_time: formatTime(String(row.work_end_time)),
  late_threshold: row.late_threshold,
  auto_approval_enabled: row.auto_approval_enabled,
  updated_at: row.updated_at,
});

export const fetchSettingsBundle = async (): Promise<SettingsBundle> => {
  const [companyRow, approval_rules, leave_types] = await Promise.all([
    unwrap(
      supabase
        .from("company_settings")
        .select(
          "id, work_start_time, work_end_time, late_threshold, auto_approval_enabled, updated_at",
        )
        .maybeSingle(),
    ),
    unwrap(
      supabase
        .from("approval_rules")
        .select(
          "id, rule_name, max_consecutive_days, min_notice_days, is_active, created_at, updated_at",
        )
        .order("created_at", { ascending: true }),
    ),
    unwrap(
      supabase
        .from("leave_types")
        .select("id, name, deduction_days, is_active, created_at")
        .order("created_at", { ascending: true }),
    ),
  ]);

  if (!companyRow) {
    throw new ApiRequestError({
      code: "NOT_FOUND",
      message: "Company settings not found.",
      details: {},
    });
  }

  return {
    company_settings: mapCompanySettings(companyRow),
    approval_rules: (approval_rules ?? []) as ApprovalRule[],
    leave_types: ((leave_types ?? []) as LeaveType[]).map((lt) => ({
      ...lt,
      deduction_days: Number(lt.deduction_days),
    })),
  };
};
