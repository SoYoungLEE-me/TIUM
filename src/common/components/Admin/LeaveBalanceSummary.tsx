import { Box, Stack, Typography } from "@mui/material";
import type { LeaveBalanceSnapshot } from "../../../models/admin/admin";

type LeaveBalanceSummaryProps = {
  balance: LeaveBalanceSnapshot;
  dense?: boolean;
};

const Stat = ({
  label,
  value,
  dense,
}: {
  label: string;
  value: number | string;
  dense?: boolean;
}) => (
  <Box>
    <Typography variant="subtitle1" sx={{ mb: 0.25 }}>
      {label}
    </Typography>
    <Typography
      variant={dense ? "body1" : "h2"}
      sx={{ fontWeight: 700, color: "text.primary" }}
    >
      {value}
    </Typography>
  </Box>
);

const LeaveBalanceSummary = ({
  balance,
  dense = false,
}: LeaveBalanceSummaryProps) => {
  return (
    <Box
      sx={{
        p: dense ? 1.5 : 2,
        borderRadius: 2,
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={dense ? 1.5 : 3}
        useFlexGap
        sx={{ flexWrap: "wrap" }}
      >
        <Stat label="부여" value={`${balance.total_days}일`} dense={dense} />
        <Stat label="사용" value={`${balance.used_days}일`} dense={dense} />
        <Stat label="잔여" value={`${balance.remaining_days}일`} dense={dense} />
        <Stat
          label="검토 대기"
          value={`${balance.pending_days}일`}
          dense={dense}
        />
        <Stat
          label="신청 가능"
          value={`${balance.available_days}일`}
          dense={dense}
        />
      </Stack>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mt: dense ? 1 : 1.5 }}
      >
        검토 중인 연차는 실제로 차감하지 않으며, 신청 가능 일수 계산에서만
        제외됩니다. 실제 차감은 승인 시에만 반영됩니다.
      </Typography>
    </Box>
  );
};

export default LeaveBalanceSummary;
