import { Box, Paper, Typography } from "@mui/material";
import type { LeaveBalanceSnapshot } from "../../../models/employee/dashboard";

type LeaveBalanceCardsProps = {
  balance: LeaveBalanceSnapshot;
};

const LeaveBalanceCards = ({ balance }: LeaveBalanceCardsProps) => {
  const {
    year,
    total_days,
    used_days,
    remaining_days,
    pending_days,
    available_days,
  } = balance;

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "repeat(2, minmax(0, 1fr))",
          md: "repeat(3, minmax(0, 1fr))",
        },
        gap: { xs: 1, sm: 1.5 },
      }}
    >
      <Paper
        sx={{
          p: { xs: 2, sm: 2.5 },
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          총 부여 연차
        </Typography>
        <Typography sx={{ fontSize: 28, fontWeight: 700, lineHeight: 1 }}>
          {total_days}일
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {year}년 기준
        </Typography>
      </Paper>

      <Paper
        sx={{
          p: { xs: 2, sm: 2.5 },
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          사용 연차
        </Typography>
        <Typography sx={{ fontSize: 28, fontWeight: 700, lineHeight: 1 }}>
          {used_days}일
        </Typography>
        <Typography variant="body2" color="text.secondary">
          승인된 연차만 차감돼요
        </Typography>
      </Paper>

      {/* 잔여 연차: 가장 중요한 숫자라 강조 */}
      <Paper
        sx={{
          gridColumn: { xs: "1 / -1", md: "auto" },
          p: { xs: 2, sm: 2.5 },
          display: "flex",
          flexDirection: "column",
          gap: 1,
          bgcolor: "primary.main",
          border: 0,
        }}
      >
        <Typography variant="body2" sx={{ color: "#EBDDEC" }}>
          잔여 연차
        </Typography>
        <Typography
          sx={{
            fontSize: 28,
            fontWeight: 700,
            lineHeight: 1,
            color: "#FFFFFF",
          }}
        >
          {remaining_days}일
        </Typography>
        <Typography variant="body2" sx={{ color: "#EBDDEC" }}>
          검토 중 {pending_days}일 · 신청 가능 {available_days}일
        </Typography>
      </Paper>
    </Box>
  );
};

export default LeaveBalanceCards;
