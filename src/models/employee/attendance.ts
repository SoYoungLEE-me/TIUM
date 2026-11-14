import type {
  ApprovalType,
  AttendanceStatus,
  LeaveRequestStatus,
} from "./dashboard";

export type AttendanceRecord = {
  id: string;
  work_date: string; // YYYY-MM-DD
  check_in: string | null; // ISO
  check_out: string | null; // ISO
  status: AttendanceStatus | null;
};

/** 캘린더에 표시할 연차 (승인 · 검토 중) */
export type CalendarLeave = {
  id: string;
  leave_type_name: string;
  start_date: string;
  end_date: string;
  total_days: number;
  status: LeaveRequestStatus;
  approval_type: ApprovalType | null;
};

export type AttendanceData = {
  employee_id: string;
  work_start_time: string; // HH:mm:ss
  work_end_time: string; // HH:mm:ss
  records: AttendanceRecord[];
  leaves: CalendarLeave[];
};

/** 캘린더 칸 상태 */
export type DayStatus =
  | "present"
  | "late"
  | "leave"
  | "leave_pending"
  | "weekend"
  | "none";

export type CalendarDay = {
  date: string; // YYYY-MM-DD
  day: number;
  isToday: boolean;
  status: DayStatus;
  record: AttendanceRecord | null;
  leave: CalendarLeave | null;
};

export type AttendanceSummary = {
  present: number;
  late: number;
  leave: number;
};
