import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import EventNoteRoundedIcon from "@mui/icons-material/EventNoteRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import { Box, Paper, Stack, Typography } from "@mui/material";
import type { SvgIconComponent } from "@mui/icons-material";
import type { AdminReviewSummary } from "../../../models/admin/admin";

type ReviewSummaryCardsProps = {
  summary: AdminReviewSummary;
};

const cards: Array<{
  key: keyof AdminReviewSummary;
  title: string;
  suffix: string;
  description: string;
  icon: SvgIconComponent;
  color: "warning" | "success" | "primary";
}> = [
  {
    key: "pending_count",
    title: "검토 대기",
    suffix: "건",
    description: "HR 확인이 필요한 신청",
    icon: AccessTimeRoundedIcon,
    color: "warning",
  },
  {
    key: "manual_processed_count",
    title: "수동 처리 완료",
    suffix: "건",
    description: "승인·반려를 포함한 처리 이력",
    icon: TaskAltRoundedIcon,
    color: "success",
  },
  {
    key: "pending_reserved_days",
    title: "검토 대기 예약 연차",
    suffix: "일",
    description: "아직 실제 사용으로 차감되지 않은 일수",
    icon: EventNoteRoundedIcon,
    color: "primary",
  },
];

const ReviewSummaryCards = ({ summary }: ReviewSummaryCardsProps) => {
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
            key={card.key}
            variant="outlined"
            sx={{
              flex: 1,
              p: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
              bgcolor: "background.paper",
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 0.75 }}
              >
                {card.title}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
                <Typography
                  sx={{
                    fontSize: 28,
                    fontWeight: 700,
                    lineHeight: 1.1,
                    color: "text.primary",
                  }}
                >
                  {summary[card.key]}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {card.suffix}
                </Typography>
              </Box>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.75 }}
              >
                {card.description}
              </Typography>
            </Box>

            <Box
              sx={(theme) => ({
                width: 44,
                height: 44,
                borderRadius: 2,
                flexShrink: 0,
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

export default ReviewSummaryCards;
