import { supabase } from "../libs/supabaseClient";
import type { Attendance } from "../models/apis/attendance";
import { rpc, unwrap } from "./apiRequest";

export type AttendanceRecordsParams = {
  startDate: string;
  endDate: string;
  employeeId?: string | null;
};

export const checkIn = async (): Promise<Attendance> =>
  rpc<Attendance>("check_in");

export const checkOut = async (): Promise<Attendance> =>
  rpc<Attendance>("check_out");

export const getAttendanceRecords = async ({
  startDate,
  endDate,
  employeeId = null,
}: AttendanceRecordsParams): Promise<Attendance[]> => {
  const data = await rpc<Attendance[] | null>("get_attendance_records", {
    p_start_date: startDate,
    p_end_date: endDate,
    p_employee_id: employeeId,
  });
  return data ?? [];
};

/** YYYY-MM → 해당 월 1일~말일 */
export const monthToDateRange = (month: string) => {
  const [yearStr, monthStr] = month.split("-");
  const year = Number(yearStr);
  const monthIndex = Number(monthStr);
  const lastDay = new Date(year, monthIndex, 0).getDate();
  return {
    startDate: `${month}-01`,
    endDate: `${month}-${String(lastDay).padStart(2, "0")}`,
  };
};

/** 오늘(Asia/Seoul) 근태 단건 SELECT — dashboard 등에서 사용 */
export const getTodayAttendance = async (
  employeeId: string
): Promise<Attendance | null> => {
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  return unwrap(
    supabase
      .from("attendance_records")
      .select("id, employee_id, work_date, check_in, check_out, status")
      .eq("employee_id", employeeId)
      .eq("work_date", today)
      .maybeSingle()
  );
};
