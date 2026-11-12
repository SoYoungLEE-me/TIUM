import { Chip } from "@mui/material";
import type {
  ApprovalType,
  LeaveRequestStatus,
} from "../../../models/employee/dashboard";

type LeaveStatusChipProps = {
  status: LeaveRequestStatus;
  approvalType: ApprovalType | null;
};

// TODO: 머지 후 곧통 LeaveStatusChip으로 합치기
const LeaveStatusChip = ({ status, approvalType }: LeaveStatusChipProps) => {
  if (status === "cancelled") {
    return (
      <Chip
        size="small"
        label="취소"
        sx={{ bgcolor: "#F1EEE8", color: "#6E6670", fontWeight: 600 }}
      />
    );
  }

  const label =
    status === "approved"
      ? approvalType === "auto"
        ? "자동 승인"
        : "승인 완료"
      : status === "pending"
      ? "검토 중"
      : "반려";

  return (
    <Chip
      size="small"
      label={label}
      sx={(theme) => ({
        bgcolor: theme.palette.leave[status].bg,
        color: theme.palette.leave[status].fg,
        fontWeight: 600,
      })}
    />
  );
};

export default LeaveStatusChip;
