export type CompanySettings = {
  work_start_time: string;
  work_end_time: string;
  late_threshold: number;
  auto_approval_enabled: boolean;
  updated_at: string;
};

export type ApprovalRule = {
  id: string;
  rule_name: string;
  max_consecutive_days: number | null;
  min_notice_days: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type LeaveType = {
  id: string;
  name: string;
  deduction_days: number;
  is_active: boolean;
  created_at: string;
};

export type AdminSettingsState = {
  company_settings: CompanySettings;
  approval_rules: ApprovalRule[];
  leave_types: LeaveType[];
};

export type CompanySettingsUpdate = Partial<
  Omit<CompanySettings, "updated_at">
>;
