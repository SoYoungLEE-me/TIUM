import { Box, Typography } from "@mui/material";
import { formatLeaveDays } from "../../../utils/admin/leaves";

type LeaveUsageGaugeProps = {
  availableDays: number;
  totalDays: number;
};

/** 신청 가능 일수 + 보라색 진행 바 */
const LeaveUsageGauge = ({
  availableDays,
  totalDays,
}: LeaveUsageGaugeProps) => {
  const ratio =
    totalDays <= 0 ? 0 : Math.min(100, (availableDays / totalDays) * 100);

  return (
    <Box sx={{ minWidth: 88 }}>
      <Typography sx={{ fontWeight: 700, mb: 0.75 }}>
        {formatLeaveDays(availableDays)}
      </Typography>
      <Box
        sx={{
          height: 6,
          borderRadius: 999,
          bgcolor: "#F1E8F1",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            width: `${ratio}%`,
            height: "100%",
            bgcolor: "primary.main",
            borderRadius: 999,
            transition: "width 0.25s ease",
          }}
        />
      </Box>
    </Box>
  );
};

export default LeaveUsageGauge;
