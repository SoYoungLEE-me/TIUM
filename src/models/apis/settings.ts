/**
 * 근무 요일 (1=월 … 7=일).
 * 회사마다 근무요일이 다를 수 있어(예: 월~금, 월~토),
 * 연차 일수 산정·근무일 판정·캘린더/근태 기준에 사용한다.
 * work_date(특정 날짜의 근무일)와는 다르다.
 */

export type Workday = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type Settings = {
  id: true;
  work_start_time: string;
  work_end_time: string;
  /** @see Workday — DB/OpenAPI 반영 전까지는 계약 선행 필드 */
  workdays: Workday[];
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
      | "workdays"
      | "late_threshold"
      | "auto_approval_enabled"
    >
  >;
  approval_rules?: ApprovalRule[];
  leave_types?: LeaveType[];
};
