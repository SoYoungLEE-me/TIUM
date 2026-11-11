import { Box, Button, Chip, Typography } from "@mui/material";
import type { LeavePreview, SubmittedLeave } from "../types";

type LeaveConfirmationCardProps = {
  payload: LeavePreview;
  submitted?: boolean;
  submitResult?: SubmittedLeave;
  submitting?: boolean;
  disabled?: boolean;
  onEdit: () => void;
  onSubmit: () => void;
};

const formatDate = (isoDate: string) => {
  const date = new Date(`${isoDate}T00:00:00`);
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}.${m}.${d} (${weekdays[date.getDay()]})`;
};

const LeaveConfirmationCard = ({
  payload,
  submitted = false,
  submitResult,
  submitting = false,
  disabled = false,
  onEdit,
  onSubmit,
}: LeaveConfirmationCardProps) => {
  const isAuto = payload.expected_status === "approved";
  const isDisabled =
    disabled || submitted || submitting || !payload.can_submit;

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 280,
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        p: 2,
        display: "flex",
        flexDirection: "column",
        gap: 1.25,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: 15 }}>
          {payload.leave_type_name}
        </Typography>
        {isAuto && !submitted && (
          <Chip
            label="자동 승인 가능"
            size="small"
            sx={(theme) => ({
              bgcolor: theme.palette.leave.approved.bg,
              color: theme.palette.leave.approved.fg,
            })}
          />
        )}
        {!isAuto && !submitted && (
          <Chip
            label="HR 검토"
            size="small"
            sx={(theme) => ({
              bgcolor: theme.palette.leave.pending.bg,
              color: theme.palette.leave.pending.fg,
            })}
          />
        )}
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        <Typography variant="body2" color="text.secondary">
          날짜: {formatDate(payload.start_date)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          차감: {payload.total_days}일
        </Typography>
      </Box>

      {submitted && submitResult && (
        <Typography variant="body2" color="text.secondary">
          {submitResult.message}
        </Typography>
      )}

      {!submitted && (
        <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
          <Button
            variant="outlined"
            size="small"
            disabled={isDisabled}
            onClick={onEdit}
            sx={{
              flex: 1,
              borderRadius: 999,
              borderColor: "divider",
              color: "text.primary",
            }}
          >
            수정
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="small"
            disabled={isDisabled}
            onClick={onSubmit}
            sx={{ flex: 1.4, borderRadius: 999 }}
          >
            {submitting ? "제출 중..." : "확인 후 신청"}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default LeaveConfirmationCard;
