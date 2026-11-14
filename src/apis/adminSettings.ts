import { supabase } from "../libs/supabaseClient";
import { ApiRequestError } from "../models/apis/common";
import type {
  ApprovalRule,
  LeaveType,
  SettingsBundle,
  SettingsUpdate,
} from "../models/apis/settings";
import { rpc, unwrap } from "./apiRequest";
import { fetchSettingsBundle } from "./settingsBundle";

export type CreateApprovalRuleInput = {
  rule_name: string;
  min_notice_days: number;
  max_consecutive_days: number | null;
  is_active: boolean;
};

export type UpdateApprovalRuleInput = CreateApprovalRuleInput & {
  id: string;
};

export type UpdateLeaveTypeInput = {
  id: string;
  name?: string;
  deduction_days?: number;
  is_active?: boolean;
};

export const getAdminSettings = async (): Promise<SettingsBundle> =>
  fetchSettingsBundle();

/** company_settings만 `update_company_settings` rpc로 반영 */
export const updateAdminSettings = async (
  body: SettingsUpdate
): Promise<SettingsBundle> => {
  const cs = body.company_settings;
  if (cs) {
    await rpc("update_company_settings", {
      p_work_start_time: cs.work_start_time,
      p_work_end_time: cs.work_end_time,
      p_late_threshold: cs.late_threshold,
      p_auto_approval_enabled: cs.auto_approval_enabled,
    });
  }

  return fetchSettingsBundle();
};

export const createApprovalRule = async (
  input: CreateApprovalRuleInput
): Promise<ApprovalRule> => {
  const data = await rpc<ApprovalRule>("create_approval_rule", {
    p_rule_name: input.rule_name,
    p_min_notice_days: input.min_notice_days,
    p_max_consecutive_days: input.max_consecutive_days,
    p_is_active: input.is_active,
  });
  return data;
};

export const updateApprovalRule = async (
  input: UpdateApprovalRuleInput
): Promise<ApprovalRule> => {
  const data = await rpc<ApprovalRule>("update_approval_rule", {
    p_rule_id: input.id,
    p_rule_name: input.rule_name,
    p_min_notice_days: input.min_notice_days,
    p_max_consecutive_days: input.max_consecutive_days,
    p_is_active: input.is_active,
  });
  return data;
};

export const updateLeaveType = async (
  input: UpdateLeaveTypeInput
): Promise<LeaveType> => {
  const patch: Record<string, unknown> = {};
  if (input.name !== undefined) patch.name = input.name;
  if (input.deduction_days !== undefined) {
    patch.deduction_days = input.deduction_days;
  }
  if (input.is_active !== undefined) patch.is_active = input.is_active;

  const row = await unwrap(
    supabase
      .from("leave_types")
      .update(patch)
      .eq("id", input.id)
      .select("id, name, deduction_days, is_active, created_at")
      .maybeSingle()
  );

  if (!row) {
    throw new ApiRequestError({
      code: "NOT_FOUND",
      message: "Leave type not found.",
      details: {},
    });
  }

  return {
    ...(row as LeaveType),
    deduction_days: Number((row as LeaveType).deduction_days),
  };
};
