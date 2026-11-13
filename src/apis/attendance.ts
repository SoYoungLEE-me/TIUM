import type { DataResponse } from "../models/apis/common";
import type {
  Attendance,
  AttendanceCalendarData,
} from "../models/apis/attendance";
import { apiRequest } from "./apiRequest";
import { API_PATHS } from "./paths";

export const checkIn = async (): Promise<Attendance> => {
  const { data } = await apiRequest.post<DataResponse<Attendance>>(
    API_PATHS.attendanceCheckIn
  );
  return data.data;
};

export const checkOut = async (): Promise<Attendance> => {
  const { data } = await apiRequest.post<DataResponse<Attendance>>(
    API_PATHS.attendanceCheckOut
  );
  return data.data;
};

export const getAttendanceCalendar = async (params?: {
  month?: string;
}): Promise<AttendanceCalendarData> => {
  const { data } = await apiRequest.get<DataResponse<AttendanceCalendarData>>(
    API_PATHS.attendance,
    { params }
  );
  return data.data;
};
