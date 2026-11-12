import { Box, Link, Paper, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router";
import type { LeaveBalanceSnapshot } from "../../../models/employee/dashboard";
import { toPercent } from "../../../utils/employee/dashboard";

type LeaveSummaryCardProps = {
  balance: LeaveBalanceSnapshot;
};

const LeaveSummaryCard = ({ balance }: LeaveSummaryCardProps) => {
  const {
    total_days,
    used_days,
    remaining_days,
    pending_days,
    available_days,
  } = balance;

  const stats = [
    { label: "사용", value: used_days },
    { label: "검토 중", value: pending_days },
    { label: "신청 가능", value: available_days },
  ];

  return (
    <Paper sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2.25 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h2" component="h2">
          내 연차
        </Typography>
        <Link
          component={RouterLink}
          to="/leaves"
          underline="none"
          sx={{ fontSize: 13, fontWeight: 600 }}
        >
          자세히
        </Link>
      </Box>

      <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1 }}>
        <Typography
          component="p"
          sx={{
            fontSize: 44,
            fontWeight: 700,
            lineHeight: 1,
            color: "primary.main",
          }}
        >
          {remaining_days}
        </Typography>
        <Typography color="text.secondary" sx={{ fontSize: 15, pb: 0.5 }}>
          일 남음 / 총 {total_days}일
        </Typography>
      </Box>

      {/* 사용(틸) + 검토 중(크림) 비율 막대 */}
      <Box
        role="img"
        aria-label={`총 ${total_days}일 중 사용 ${used_days}일, 검토 중 ${pending_days}일`}
        sx={(theme) => ({
          height: 10,
          borderRadius: 999,
          bgcolor: theme.palette.leave.weekend.bg,
          display: "flex",
          overflow: "hidden",
        })}
      >
        <Box
          sx={{
            width: toPercent(used_days, total_days),
            bgcolor: "secondary.main",
          }}
        />
        <Box
          sx={{
            width: toPercent(pending_days, total_days),
            bgcolor: "warning.light",
          }}
        />
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 1,
        }}
      >
        {stats.map((stat) => (
          <Box
            key={stat.label}
            sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
          >
            <Typography variant="body2" color="text.secondary">
              {stat.label}
            </Typography>
            <Typography sx={{ fontSize: 16, fontWeight: 700 }}>
              {stat.value}일
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

export default LeaveSummaryCard;
