import { Chip } from "@mui/material";
import type { LeaveRequestStatus } from "../../../models/admin/admin";
import { LEAVE_STATUS_LABEL } from "../../../utils/admin/admin";

type LeaveStatusChipProps = {
  status: LeaveRequestStatus;
};

const LeaveStatusChip = ({ status }: LeaveStatusChipProps) => {
  if (status === "cancelled") {
    return (
      <Chip
        size="small"
        label={LEAVE_STATUS_LABEL.cancelled}
        sx={{
          bgcolor: "#F1EEE8",
          color: "#6E6670",
          fontWeight: 600,
        }}
      />
    );
  }

  return (
    <Chip
      size="small"
      label={LEAVE_STATUS_LABEL[status]}
      sx={(theme) => ({
        bgcolor: theme.palette.leave[status].bg,
        color: theme.palette.leave[status].fg,
        fontWeight: 600,
      })}
    />
  );
};

export default LeaveStatusChip;
