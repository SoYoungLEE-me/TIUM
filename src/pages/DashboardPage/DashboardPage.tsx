import { Alert, Box, Chip, Typography } from "@mui/material";
import {
  DASHBOARD_LOAD_ERROR,
  DASHBOARD_TITLE,
  WORK_STATUS_CHIP,
} from "../../configs/employee/dashboard";
import { useEmployeeDashboard } from "../../hooks/employee/dashboard";
import { formatTodayLabel } from "../../utils/employee/dashboard";
import AttendanceCard from "./components/AttendanceCard";
import DashboardSkeleton from "./components/DashboardSkeleton";
import LeaveSummaryCard from "./components/LeaveSummaryCard";
import RecentLeaveRequests from "./components/RecentLeaveRequests";

const DashboardPage = () => {
  const {
    checkIn,
    checkOut,
    isLate,
    workStatus,
    workHoursLabel,
    balance,
    recentRequests,
    processing,
    isLoading,
    isError,
    checkInNow,
    checkOutNow,
  } = useEmployeeDashboard();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError || !balance) {
    return <Alert severity="error">{DASHBOARD_LOAD_ERROR}</Alert>;
  }

  const statusChip = WORK_STATUS_CHIP[workStatus];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* 헤더 */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 1.5,
        }}
      >
        <Box>
          <Typography variant="body2" color="text.secondary">
            {formatTodayLabel()}
          </Typography>
          <Typography variant="h1" component="h1">
            {DASHBOARD_TITLE}
          </Typography>
        </Box>
        <Chip
          label={statusChip.label}
          sx={{
            height: 32,
            px: 0.5,
            bgcolor: statusChip.bg,
            color: statusChip.fg,
          }}
        />
      </Box>

      {/* 출퇴근 + 내 연차 */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
          gap: 2,
        }}
      >
        <AttendanceCard
          checkIn={checkIn}
          checkOut={checkOut}
          isLate={isLate}
          workHoursLabel={workHoursLabel}
          processing={processing}
          onCheckIn={checkInNow}
          onCheckOut={checkOutNow}
        />
        <LeaveSummaryCard balance={balance} />
      </Box>

      {/* 최근 연차 신청 */}
      <RecentLeaveRequests requests={recentRequests} />
    </Box>
  );
};

export default DashboardPage;
