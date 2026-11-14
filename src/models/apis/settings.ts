export type Settings = {
  id: true;
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
  created_at?: string;
  updated_at?: string;
};

export type LeaveType = {
  id: string;
  name: string;
  deduction_days: number;
  is_active: boolean;
  created_at?: string;
};

export type SettingsBundle = {
  company_settings: Settings;
  approval_rules: ApprovalRule[];
  leave_types: LeaveType[];
};

export type SettingsUpdate = {
  company_settings?: Partial<
    Pick<
      Settings,
      | "work_start_time"
      | "work_end_time"
      | "late_threshold"
      | "auto_approval_enabled"
    >
  >;
  approval_rules?: ApprovalRule[];
  leave_types?: LeaveType[];
};
