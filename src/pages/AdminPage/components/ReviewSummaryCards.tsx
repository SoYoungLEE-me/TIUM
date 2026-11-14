import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import EventNoteRoundedIcon from "@mui/icons-material/EventNoteRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import { Box, Paper, Typography } from "@mui/material";
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
            key={card.key}
            variant="outlined"
            sx={{
              p: { xs: 1.25, sm: 2 },
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: { xs: 1, sm: 2 },
              bgcolor: "background.paper",
              minWidth: 0,
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mb: { xs: 0.5, sm: 0.75 },
                  fontSize: { xs: 12, sm: undefined },
                  lineHeight: 1.3,
                }}
                noWrap
              >
                {card.title}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
                <Typography
                  sx={{
                    fontSize: { xs: 20, sm: 28 },
                    fontWeight: 700,
                    lineHeight: 1.1,
                    color: "text.primary",
                  }}
                >
                  {card.key === "pending_reserved_days"
                    ? summary.pending_reserved_days.toFixed(1)
                    : summary[card.key]}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: { xs: 12, sm: undefined } }}
                >
                  {card.suffix}
                </Typography>
              </Box>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.75,
                  display: { xs: "none", md: "block" },
                }}
              >
                {card.description}
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

export default ReviewSummaryCards;
