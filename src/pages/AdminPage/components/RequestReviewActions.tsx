import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import LeaveStatusChip from "../../../common/components/Admin/LeaveStatusChip";
import type { AdminLeaveRequest } from "../../../models/admin/admin";
import {
  canApproveExcludingSelfPending,
  formatDisplayDate,
  formatFullDateTime,
  formatRequestCode,
  getAvatarColor,
  getInitials,
} from "../../../utils/admin/admin";

type RequestReviewActionsProps = {
  request: AdminLeaveRequest | null;
  selectedIndex: number;
  processing: boolean;
  actionError: string | null;
  actionMessage: string | null;
  onApprove: (reason: string) => void;
  onReject: (reason: string) => void;
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <Stack
    direction="row"
    spacing={2}
    sx={{ justifyContent: "space-between", py: 0.6 }}
  >
    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 72 }}>
      {label}
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: 600, textAlign: "right" }}>
      {value}
    </Typography>
  </Stack>
);

const RequestReviewActions = ({
  request,
  selectedIndex,
  processing,
  actionError,
  actionMessage,
  onApprove,
  onReject,
}: RequestReviewActionsProps) => {
  const [reason, setReason] = useState("");

  if (!request) {
    return (
      <Paper
        variant="outlined"
        sx={{
          p: 3,
          height: "100%",
          animation: "reviewPanelFade 220ms ease",
          "@keyframes reviewPanelFade": {
            from: { opacity: 0.25 },
            to: { opacity: 1 },
          },
        }}
      >
        <Typography color="text.secondary">
          목록에서 신청을 선택해 주세요.
        </Typography>
      </Paper>
    );
  }

  const isPending = request.status === "pending";
  const canApprove =
    isPending &&
    canApproveExcludingSelfPending(request.balance, request.total_days);
  const periodLabel =
    request.start_date === request.end_date
      ? formatDisplayDate(request.start_date)
      : `${formatDisplayDate(request.start_date)} - ${formatDisplayDate(request.end_date)}`;

  return (
    <Paper
      variant="outlined"
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        animation: "reviewPanelFade 220ms ease",
        "@keyframes reviewPanelFade": {
          from: { opacity: 0.25 },
          to: { opacity: 1 },
        },
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{
          px: 2,
          py: 1.5,
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
          {formatRequestCode(Math.max(selectedIndex, 0))}
        </Typography>
        <LeaveStatusChip status={request.status} />
      </Stack>

      <Box sx={{ p: 2, overflow: "auto", flex: 1 }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <Avatar
              sx={{
                width: 44,
                height: 44,
                fontWeight: 700,
                bgcolor: getAvatarColor(request.employee_full_name),
              }}
            >
              {getInitials(request.employee_full_name)}
            </Avatar>
            <Box>
              <Typography sx={{ fontWeight: 700 }}>
                {request.employee_full_name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {request.department ?? "-"} · {request.employee_email}
              </Typography>
            </Box>
          </Stack>

          <Box>
            <InfoRow label="휴가 유형" value={request.leave_type_name} />
            <InfoRow label="기간" value={periodLabel} />
            <InfoRow label="차감 일수" value={`${request.total_days.toFixed(1)}일`} />
            <InfoRow
              label="신청 시각"
              value={formatFullDateTime(request.created_at)}
            />
            <InfoRow label="신청 사유" value={request.reason ?? "없음"} />
          </Box>

          {request.decision_reason && isPending ? (
            <Alert
              severity="warning"
              sx={{
                bgcolor: "leave.pending.bg",
                color: "leave.pending.fg",
                "& .MuiAlert-icon": { color: "leave.pending.fg" },
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.25 }}>
                자동 승인되지 않은 사유
              </Typography>
              <Typography variant="body2">{request.decision_reason}</Typography>
            </Alert>
          ) : null}

          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: "#F7F4EE",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
              연차 잔여 현황
            </Typography>
            <InfoRow
              label="잔여 연차"
              value={`${request.balance.remaining_days}일`}
            />
            <InfoRow
              label="검토 대기"
              value={`${request.balance.pending_days}일`}
            />
            <InfoRow
              label="신청 가능"
              value={`${request.balance.available_days}일`}
            />
            <Typography
              variant="subtitle1"
              color="text.secondary"
              sx={{ mt: 1 }}
            >
              검토 중인 연차는 실제 차감이 아니며, 신청 가능 일수에서만 제외됩니다.
            </Typography>
          </Box>

          <Divider />

          {isPending ? (
            <Stack spacing={1.5}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                처리 사유
              </Typography>
              <TextField
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                multiline
                minRows={3}
                fullWidth
                placeholder="직원에게 전달할 메시지를 입력하세요"
              />
              {!canApprove ? (
                <Alert severity="warning">
                  잔여 연차가 부족하여 승인할 수 없습니다.
                </Alert>
              ) : null}
              <Stack direction="row" spacing={1.25}>
                <Button
                  variant="outlined"
                  color="error"
                  fullWidth
                  disabled={processing}
                  startIcon={<CloseRoundedIcon />}
                  onClick={() => onReject(reason)}
                  sx={{ borderRadius: 999 }}
                >
                  반려
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={processing || !canApprove}
                  startIcon={<CheckRoundedIcon />}
                  onClick={() => onApprove(reason)}
                  sx={{ borderRadius: 999 }}
                >
                  승인
                </Button>
              </Stack>
            </Stack>
          ) : (
            <Alert severity="info">
              이미 처리된 신청입니다. 처리일시:{" "}
              {formatFullDateTime(request.reviewed_at)}
            </Alert>
          )}

          {actionError ? <Alert severity="error">{actionError}</Alert> : null}
          {actionMessage ? (
            <Alert severity="success">{actionMessage}</Alert>
          ) : null}
        </Stack>
      </Box>
    </Paper>
  );
};

export default RequestReviewActions;
