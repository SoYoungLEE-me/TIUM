import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import { Box, Paper, Stack, Typography } from "@mui/material";
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
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={1.5}
      sx={{ mb: 2.5 }}
    >
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Paper
            key={card.id}
            variant="outlined"
            sx={{
              flex: 1,
              p: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Box>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 0.5 }}
              >
                {card.label}
              </Typography>
              <Typography variant="h2" sx={{ fontWeight: 700 }}>
                {card.getValue(summary)}
              </Typography>
            </Box>
            <Box
              sx={(theme) => ({
                width: 44,
                height: 44,
                borderRadius: 2,
                display: "inline-flex",
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
              <Icon />
            </Box>
          </Paper>
        );
      })}
    </Stack>
  );
};

export default LeavesSummaryCards;
