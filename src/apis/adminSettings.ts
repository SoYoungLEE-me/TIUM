import type { SettingsBundle, SettingsUpdate } from "../models/apis/settings";
import { rpc } from "./apiRequest";
import { fetchSettingsBundle } from "./settingsBundle";

export const getAdminSettings = async (): Promise<SettingsBundle> =>
  fetchSettingsBundle();

/**
 * company_settings만 `update_company_settings` rpc로 반영.
 * approval_rules / leave_types 전용 rpc는 레포에 아직 없음.
 */
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
