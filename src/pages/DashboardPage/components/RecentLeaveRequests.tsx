import { Box, Link, Paper, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router";
import LeaveStatusChip from "../../../common/components/Employee/LeaveStatusChip";
import type { RecentLeaveRequest } from "../../../models/employee/dashboard";
import {
  formatLeavePeriod,
  getMonthDay,
} from "../../../utils/employee/dashboard";

type RecentLeaveRequestsProps = {
  requests: RecentLeaveRequest[];
};

const RecentLeaveRequests = ({ requests }: RecentLeaveRequestsProps) => (
  <Paper sx={{ p: 3, display: "flex", flexDirection: "column" }}>
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 1,
      }}
    >
      <Typography variant="h2" component="h2">
        최근 연차 신청
      </Typography>
      <Link
        component={RouterLink}
        to="/leaves"
        underline="none"
        sx={{ fontSize: 13, fontWeight: 600 }}
      >
        전체 보기
      </Link>
    </Box>

    {requests.length === 0 ? (
      <Typography color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
        아직 연차 신청 내역이 없어요.
      </Typography>
    ) : (
      requests.map((request) => {
        const { month, day } = getMonthDay(request.start_date);
        return (
          <Box
            key={request.id}
            sx={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 1.5,
              py: 1.75,
              borderTop: 1,
              borderColor: "divider",
            }}
          >
            {/* 날짜 뱃지 */}
            <Box
              aria-hidden="true"
              sx={{
                width: 44,
                height: 44,
                flex: "none",
                borderRadius: "12px",
                bgcolor: "background.default",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography
                sx={{ fontSize: 10, fontWeight: 700, color: "text.secondary" }}
              >
                {month}월
              </Typography>
              <Typography
                sx={{ fontSize: 15, fontWeight: 700, lineHeight: 1.1 }}
              >
                {day}
              </Typography>
            </Box>

            <Box sx={{ flex: "1 1 200px", minWidth: 0 }}>
              <Typography sx={{ fontWeight: 700 }}>
                {request.leave_type_name} · {request.total_days}일
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {formatLeavePeriod(request.start_date, request.end_date)}
                {request.decision_reason ? ` · ${request.decision_reason}` : ""}
              </Typography>
            </Box>

            <LeaveStatusChip
              status={request.status}
              approvalType={request.approval_type}
            />
          </Box>
        );
      })
    )}
  </Paper>
);

export default RecentLeaveRequests;
