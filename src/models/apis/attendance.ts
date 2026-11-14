export type AttendanceStatus = "present" | "late";

/** 출근/퇴근 RPC 및 단건 응답 */
export type Attendance = {
  id: string;
  employee_id: string;
  work_date: string;
  check_in: string | null;
  check_out: string | null;
  status: AttendanceStatus | null;
};

export type TodayAttendance = Attendance;

/** 캘린더 records[] 항목 */
export type AttendanceRecord = {
  id: string;
  work_date: string;
  check_in: string | null;
  check_out: string | null;
  status: AttendanceStatus | null;
};

export type CalendarLeave = {
  id: string;
  leave_type_name: string;
  start_date: string;
  end_date: string;
  total_days: number;
  status: "pending" | "approved" | "rejected" | "cancelled";
  approval_type: "auto" | "manual" | null;
};

/**
 * 캘린더 합성 응답 (leaves + settings).
 * 근태 rpc는 Attendance[]만 반환 — 합성은 페이지/후속 레이어에서 조합.
 */
export type AttendanceCalendarData = {
  employee_id: string;
  work_start_time: string;
  work_end_time: string;
  records: AttendanceRecord[];
  leaves: CalendarLeave[];
};
