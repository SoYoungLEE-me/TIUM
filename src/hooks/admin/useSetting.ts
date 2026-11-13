import { useMemo, useState } from "react";
import settingMock from "../../mocks/admin/setting.json";
import type {
  AdminSettingsState,
  CompanySettings,
  CompanySettingsUpdate,
} from "../../models/admin/setting";
import {
  applyCompanySettingsUpdate,
  toggleLeaveTypeActive,
  updateApprovalRuleLimits,
  validateWorkingHours,
} from "../../utils/admin/setting";

const initialState = settingMock as AdminSettingsState;

const isSameCompanySettings = (a: CompanySettings, b: CompanySettings) =>
  a.work_start_time === b.work_start_time &&
  a.work_end_time === b.work_end_time &&
  a.late_threshold === b.late_threshold &&
  a.auto_approval_enabled === b.auto_approval_enabled;

export const useAdminSettings = () => {
  const [settings, setSettings] = useState<AdminSettingsState>(initialState);
  const [draft, setDraft] = useState(initialState.company_settings);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dirty = useMemo(
    () => !isSameCompanySettings(draft, settings.company_settings),
    [draft, settings.company_settings]
  );

  const updateDraft = (update: CompanySettingsUpdate) => {
    setDraft((prev) => ({ ...prev, ...update }));
    setMessage(null);
  };

  const resetDraft = () => {
    setDraft(settings.company_settings);
    setError(null);
    setMessage(null);
  };

  const saveCompanySettings = () => {
    const hoursError = validateWorkingHours(
      draft.work_start_time,
      draft.work_end_time
    );
    if (hoursError) {
      setError(hoursError);
      setMessage(null);
      return;
    }

    const next = applyCompanySettingsUpdate(settings.company_settings, {
      work_start_time: draft.work_start_time,
      work_end_time: draft.work_end_time,
      late_threshold: draft.late_threshold,
      auto_approval_enabled: draft.auto_approval_enabled,
    });

    setSettings((prev) => ({ ...prev, company_settings: next }));
    setDraft(next);
    setError(null);
    setMessage(null);
  };

  const updateApprovalRuleLimitsForRule = (
    ruleId: string,
    update: Partial<{
      min_notice_days: number;
      max_consecutive_days: number | null;
    }>,
  ) => {
    setSettings((prev) => ({
      ...prev,
      approval_rules: updateApprovalRuleLimits(
        prev.approval_rules,
        ruleId,
        update,
      ),
    }));
  };

  const toggleLeaveType = (typeId: string) => {
    setSettings((prev) => ({
      ...prev,
      leave_types: toggleLeaveTypeActive(prev.leave_types, typeId),
    }));
  };

  return {
    settings,
    draft,
    dirty,
    message,
    error,
    updateDraft,
    resetDraft,
    saveCompanySettings,
    updateApprovalRuleLimitsForRule,
    toggleLeaveType,
  };
};
