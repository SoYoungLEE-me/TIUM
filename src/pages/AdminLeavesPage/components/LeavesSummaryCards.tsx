import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import { Box, Paper, Typography } from "@mui/material";
import type { LeavesPageSummary } from "../../../models/admin/leaves";
import { formatLeaveDays } from "../../../utils/admin/leaves";

type LeavesSummaryCardsProps = {
  summary: LeavesPageSummary;
};

const cards = [
  {
    id: "count",
    label: "조회 대상",
    icon: GroupsRoundedIcon,
    color: "primary",
    getValue: (summary: LeavesPageSummary) => `${summary.employee_count} 명`,
  },
  {
    id: "remaining",
    label: "총 잔여 연차",
    icon: CalendarMonthRoundedIcon,
    color: "success",
    getValue: (summary: LeavesPageSummary) =>
      `${formatLeaveDays(summary.total_remaining_days)} 일`,
  },
  {
    id: "pending",
    label: "검토 대기",
    icon: AccessTimeRoundedIcon,
    color: "warning",
    getValue: (summary: LeavesPageSummary) =>
      `${formatLeaveDays(summary.total_pending_days)} 일`,
  },
];

const LeavesSummaryCards = ({ summary }: LeavesSummaryCardsProps) => {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: { xs: 1, sm: 1.5 },
        mb: 2.5,
      }}
    >
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Paper
            key={card.id}
            variant="outlined"
            sx={{
              p: { xs: 1.25, sm: 2 },
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: { xs: 1, sm: 2 },
              minWidth: 0,
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mb: 0.5,
                  fontSize: { xs: 12, sm: undefined },
                  lineHeight: 1.3,
                }}
                noWrap
              >
                {card.label}
              </Typography>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: 16, sm: undefined },
                }}
                noWrap
              >
                {card.getValue(summary)}
              </Typography>
            </Box>
            <Box
              sx={(theme) => ({
                width: { xs: 32, sm: 44 },
                height: { xs: 32, sm: 44 },
                borderRadius: 2,
                flexShrink: 0,
                display: { xs: "none", sm: "inline-flex" },
                alignItems: "center",
                justifyContent: "center",
                bgcolor:
                  card.color === "primary"
                    ? "#F1E8F1"
                    : card.color === "success"
                      ? theme.palette.leave.approved.bg
                      : theme.palette.leave.pending.bg,
                color:
                  card.color === "primary"
                    ? theme.palette.primary.main
                    : card.color === "success"
                      ? theme.palette.success.main
                      : theme.palette.warning.main,
              })}
            >
              <Icon fontSize="small" />
            </Box>
          </Paper>
        );
      })}
    </Box>
  );
};

export default LeavesSummaryCards;
