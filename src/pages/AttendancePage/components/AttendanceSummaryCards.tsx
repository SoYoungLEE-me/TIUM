import { Box, Paper, Typography } from "@mui/material";
import { DAY_STATUS_STYLE } from "../../../configs/employee/attendance";
import type { AttendanceSummary } from "../../../models/employee/attendance";

type AttendanceSummaryCardsProps = {
  summary: AttendanceSummary;
};

const AttendanceSummaryCards = ({ summary }: AttendanceSummaryCardsProps) => {
  const cards = [
    { key: "present", label: "정상 출근", value: summary.present },
    { key: "late", label: "지각", value: summary.late },
    { key: "leave", label: "연차 사용", value: summary.leave },
  ] as const;

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: { xs: 1, sm: 1.5 },
      }}
    >
      {cards.map((card) => {
        const style = DAY_STATUS_STYLE[card.key];
        return (
          <Paper
            key={card.key}
            sx={{
              p: { xs: 1.5, sm: 2 },
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "flex-start", sm: "center" },
              gap: { xs: 0.75, sm: 1.5 },
            }}
          >
            <Box
              aria-hidden="true"
              sx={{
                width: 12,
                height: 12,
                flex: "none",
                borderRadius: "4px",
                bgcolor: style.bg,
                border: 1,
                borderColor: style.border,
              }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
              {card.label}
            </Typography>
            <Typography sx={{ fontSize: 20, fontWeight: 700 }}>
              {card.value}일
            </Typography>
          </Paper>
        );
      })}
    </Box>
  );
};

export default AttendanceSummaryCards;
