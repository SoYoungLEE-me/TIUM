import type {
  ApprovalRule,
  CompanySettings,
  CompanySettingsUpdate,
  LeaveType,
} from "../../models/admin/setting";

export type DayPeriod = "am" | "pm";

export const formatTimeLabel = (time: string) => time.slice(0, 5);

export const parseTimeParts = (time: string) => {
  const label = formatTimeLabel(time);
  const [hour = "09", minute = "00"] = label.split(":");
  return { hour, minute };
};

export const buildTimeValue = (hour: string, minute: string) =>
  `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}:00`;

export const parseTimeTo12h = (time: string) => {
  const { hour, minute } = parseTimeParts(time);
  const hour24 = Number(hour);
  const period: DayPeriod = hour24 >= 12 ? "pm" : "am";
  const hour12Value = hour24 % 12 === 0 ? 12 : hour24 % 12;

  return {
    period,
    hour12: String(hour12Value).padStart(2, "0"),
    minute,
  };
};

export const buildTimeValueFrom12h = (
  period: DayPeriod,
  hour12: string,
  minute: string
) => {
  const parsed = Number(hour12);
  let hour24 = parsed % 12;
  if (period === "pm") hour24 += 12;
  return buildTimeValue(String(hour24), minute);
};

export const formatTimeLabel12h = (time: string) => {
  const { period, hour12, minute } = parseTimeTo12h(time);
  const periodLabel = period === "am" ? "오전" : "오후";
  return `${periodLabel} ${hour12}:${minute}`;
};

export const applyCompanySettingsUpdate = (
  current: CompanySettings,
  update: CompanySettingsUpdate
): CompanySettings => ({
  ...current,
  ...update,
  updated_at: new Date().toISOString(),
});

export const toggleApprovalRuleActive = (
  rules: ApprovalRule[],
  ruleId: string
): ApprovalRule[] =>
  rules.map((rule) =>
    rule.id === ruleId
      ? {
          ...rule,
          is_active: !rule.is_active,
          updated_at: new Date().toISOString(),
        }
      : rule
  );

export const getPrimaryApprovalRule = (rules: ApprovalRule[]) =>
  rules.find((rule) => rule.is_active) ?? rules[0] ?? null;

export const updateApprovalRuleLimits = (
  rules: ApprovalRule[],
  ruleId: string,
  update: Partial<Pick<ApprovalRule, "max_consecutive_days" | "min_notice_days">>
): ApprovalRule[] =>
  rules.map((rule) =>
    rule.id === ruleId
      ? {
          ...rule,
          ...update,
          updated_at: new Date().toISOString(),
        }
      : rule
  );

export const toggleLeaveTypeActive = (
  types: LeaveType[],
  typeId: string
): LeaveType[] =>
  types.map((type) =>
    type.id === typeId ? { ...type, is_active: !type.is_active } : type
  );

export const validateWorkingHours = (
  start: string,
  end: string
): string | null => {
  if (end <= start) {
    return "퇴근 시각은 출근 시각보다 이후여야 합니다.";
  }
  return null;
};
