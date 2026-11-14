import { useMemo, useState } from "react";
import {
  useAdminSettingsQuery,
  useUpdateAdminSettings,
  useUpdateApprovalRule,
  useUpdateLeaveType,
} from "../apis/useAdminSettings";
import type {
  AdminSettingsState,
  CompanySettings,
  CompanySettingsUpdate,
} from "../../models/admin/setting";
import { toast } from "../../common/components/toast";
import { ApiRequestError } from "../../models/apis/common";
import { validateWorkingHours } from "../../utils/admin/setting";

const emptySettings = (): AdminSettingsState => ({
  company_settings: {
    work_start_time: "09:00:00",
    work_end_time: "18:00:00",
    late_threshold: 0,
    auto_approval_enabled: false,
    updated_at: new Date().toISOString(),
  },
  approval_rules: [],
  leave_types: [],
});

const mapBundle = (
  bundle: NonNullable<ReturnType<typeof useAdminSettingsQuery>["data"]>
): AdminSettingsState => ({
  company_settings: {
    work_start_time: bundle.company_settings.work_start_time.includes(":")
      ? bundle.company_settings.work_start_time.length === 5
        ? `${bundle.company_settings.work_start_time}:00`
        : bundle.company_settings.work_start_time
      : bundle.company_settings.work_start_time,
    work_end_time: bundle.company_settings.work_end_time.includes(":")
      ? bundle.company_settings.work_end_time.length === 5
        ? `${bundle.company_settings.work_end_time}:00`
        : bundle.company_settings.work_end_time
      : bundle.company_settings.work_end_time,
    late_threshold: bundle.company_settings.late_threshold,
    auto_approval_enabled: bundle.company_settings.auto_approval_enabled,
    updated_at: bundle.company_settings.updated_at,
  },
  approval_rules: bundle.approval_rules.map((rule) => ({
    id: rule.id,
    rule_name: rule.rule_name,
    max_consecutive_days: rule.max_consecutive_days,
    min_notice_days: rule.min_notice_days,
    is_active: rule.is_active,
    created_at: rule.created_at ?? "",
    updated_at: rule.updated_at ?? "",
  })),
  leave_types: bundle.leave_types.map((type) => ({
    id: type.id,
    name: type.name,
    deduction_days: type.deduction_days,
    is_active: type.is_active,
    created_at: type.created_at ?? "",
  })),
});

export const useAdminSettings = () => {
  const settingsQuery = useAdminSettingsQuery();
  const updateSettingsMutation = useUpdateAdminSettings();
  const updateRuleMutation = useUpdateApprovalRule();
  const updateLeaveTypeMutation = useUpdateLeaveType();

  const settings = useMemo(
    () =>
      settingsQuery.data ? mapBundle(settingsQuery.data) : emptySettings(),
    [settingsQuery.data]
  );

  const [error, setError] = useState<string | null>(null);

  const saveCompanySettings = async (update: CompanySettingsUpdate) => {
    const next: CompanySettings = {
      ...settings.company_settings,
      ...update,
    };
    const hoursError = validateWorkingHours(
      next.work_start_time,
      next.work_end_time
    );
    if (hoursError) {
      setError(hoursError);
      toast.warning(hoursError);
      return;
    }

    setError(null);
    try {
      await updateSettingsMutation.mutateAsync({
        company_settings: {
          work_start_time: next.work_start_time.slice(0, 5),
          work_end_time: next.work_end_time.slice(0, 5),
          late_threshold: next.late_threshold,
          auto_approval_enabled: next.auto_approval_enabled,
        },
      });
      toast.success("설정이 저장되었습니다.");
      void settingsQuery.refetch();
    } catch (err) {
      const msg =
        err instanceof ApiRequestError
          ? err.message
          : err instanceof Error
            ? err.message
            : "설정 저장에 실패했습니다.";
      setError(msg);
      toast.error(msg);
    }
  };

  const updateApprovalRuleLimitsForRule = async (
    ruleId: string,
    update: Partial<{
      min_notice_days: number;
      max_consecutive_days: number | null;
    }>
  ) => {
    const rule = settings.approval_rules.find((item) => item.id === ruleId);
    if (!rule) return;

    setError(null);
    try {
      await updateRuleMutation.mutateAsync({
        id: rule.id,
        rule_name: rule.rule_name,
        min_notice_days: update.min_notice_days ?? rule.min_notice_days,
        max_consecutive_days:
          update.max_consecutive_days !== undefined
            ? update.max_consecutive_days
            : rule.max_consecutive_days,
        is_active: rule.is_active,
      });
      toast.success("승인 규칙이 저장되었습니다.");
      void settingsQuery.refetch();
    } catch (err) {
      const msg =
        err instanceof ApiRequestError
          ? err.message
          : err instanceof Error
            ? err.message
            : "승인 규칙 수정에 실패했습니다.";
      setError(msg);
      toast.error(msg);
    }
  };

  const toggleLeaveType = async (typeId: string) => {
    const type = settings.leave_types.find((item) => item.id === typeId);
    if (!type) return;

    setError(null);
    try {
      await updateLeaveTypeMutation.mutateAsync({
        id: type.id,
        is_active: !type.is_active,
      });
      toast.success(
        type.is_active
          ? `${type.name}이(가) 비활성화되었습니다.`
          : `${type.name}이(가) 활성화되었습니다.`
      );
      void settingsQuery.refetch();
    } catch (err) {
      const msg =
        err instanceof ApiRequestError
          ? err.message
          : err instanceof Error
            ? err.message
            : "휴가 유형 수정에 실패했습니다.";
      setError(msg);
      toast.error(msg);
    }
  };

  return {
    settings,
    error:
      error ??
      (settingsQuery.error instanceof Error
        ? settingsQuery.error.message
        : settingsQuery.isError
          ? "설정을 불러오지 못했습니다."
          : null),
    isLoading: settingsQuery.isLoading,
    saveCompanySettings,
    updateApprovalRuleLimitsForRule,
    toggleLeaveType,
  };
};
