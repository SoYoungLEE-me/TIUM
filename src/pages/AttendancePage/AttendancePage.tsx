import { Box, Typography } from "@mui/material";
import {
  ATTENDANCE_DESCRIPTION,
  ATTENDANCE_TITLE,
} from "../../configs/employee/attendance";
import { useEmployeeAttendance } from "../../hooks/employee/attendance";
import AttendanceCalendar from "./components/AttendanceCalendar";
import AttendanceDayDetail from "./components/AttendanceDayDetail";
import AttendanceSummaryCards from "./components/AttendanceSummaryCards";

const AttendancePage = () => {
  const {
    monthKey,
    days,
    summary,
    selectedDay,
    workStartTime,
    isThisMonth,
    selectDate,
    goPrevMonth,
    goNextMonth,
    goThisMonth,
  } = useEmployeeAttendance();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* 헤더 */}
      <Box>
        <Typography variant="h1" component="h1">
          {ATTENDANCE_TITLE}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {ATTENDANCE_DESCRIPTION}
        </Typography>
      </Box>

      <AttendanceSummaryCards summary={summary} />

      {/* 캘린더 + 날짜 상세 */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) 340px" },
          gap: 2,
          alignItems: "start",
        }}
      >
        <AttendanceCalendar
          monthKey={monthKey}
          days={days}
          selectedDate={selectedDay?.date ?? null}
          isThisMonth={isThisMonth}
          onSelectDate={selectDate}
          onPrevMonth={goPrevMonth}
          onNextMonth={goNextMonth}
          onThisMonth={goThisMonth}
        />
        <AttendanceDayDetail day={selectedDay} workStartTime={workStartTime} />
      </Box>
    </Box>
  );
};

export default AttendancePage;
