import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  alpha,
} from "@mui/material";
import {
  DEFAULT_LEAVE_YEAR,
  GRANT_DAY_MAX,
  GRANT_DAY_MIN,
  GRANT_DAY_STEP,
  GRANT_DIALOG_DESCRIPTION,
  GRANT_DIALOG_TITLE,
  GRANT_REASON_PLACEHOLDER,
} from "../../../configs/admin/leaves";
import type {
  EmployeeLeaveRow,
  GrantLeaveInput,
} from "../../../models/admin/leaves";
import { formatLeaveDays } from "../../../utils/admin/leaves";

type GrantLeaveDialogProps = {
  open: boolean;
  employees: EmployeeLeaveRow[];
  initialEmployeeId: string | null;
  year: number;
  error: string | null;
  onClose: () => void;
  onSubmit: (payload: GrantLeaveInput) => boolean;
};

const GrantLeaveDialog = ({
  open,
  employees,
  initialEmployeeId,
  year,
  error,
  onClose,
  onSubmit,
}: GrantLeaveDialogProps) => {
  const [employeeId, setEmployeeId] = useState(initialEmployeeId ?? "");
  const [days, setDays] = useState("1");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) return;
    setEmployeeId(initialEmployeeId ?? "");
    setDays("1");
    setReason("");
  }, [open, initialEmployeeId]);

  const selected = useMemo(
    () => employees.find((row) => row.employee.id === employeeId) ?? null,
    [employees, employeeId]
  );

  const parsedDays = Number(days) || 0;
  const previewTotal = selected
    ? Number((selected.balance.total_days + parsedDays).toFixed(1))
    : null;

  const handleSubmit = () => {
    onSubmit({
      employee_id: employeeId,
      days: parsedDays,
      reason: reason.trim(),
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ pr: 6 }}>
        <Typography component="span" sx={{ fontWeight: 700 }}>
          {GRANT_DIALOG_TITLE}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {GRANT_DIALOG_DESCRIPTION}
        </Typography>
        <IconButton
          aria-label="닫기"
          onClick={onClose}
          sx={{ position: "absolute", right: 12, top: 12 }}
        >
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        dividers
        sx={(theme) => ({
          overflowY: "auto",
          overflowX: "hidden",
          scrollbarWidth: "thin",
          scrollbarColor: `${alpha(theme.palette.primary.main, 0.45)} transparent`,
          "&::-webkit-scrollbar": {
            width: 6,
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: alpha(theme.palette.primary.main, 0.45),
            borderRadius: 999,
            border: "2px solid transparent",
            backgroundClip: "content-box",
            "&:hover": {
              backgroundColor: alpha(theme.palette.primary.main, 0.65),
            },
          },
        })}
      >
        <Stack spacing={2.25}>
          <FormControl fullWidth>
            <InputLabel id="grant-employee-label">직원</InputLabel>
            <Select
              labelId="grant-employee-label"
              label="직원"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
            >
              {employees.map((row) => (
                <MenuItem key={row.employee.id} value={row.employee.id}>
                  {row.employee.full_name} · {row.employee.department ?? "-"}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <FormControl fullWidth>
              <InputLabel id="grant-year-label">관리 연도</InputLabel>
              <Select
                labelId="grant-year-label"
                label="관리 연도"
                value={year}
                disabled
              >
                <MenuItem value={year}>{year}</MenuItem>
                <MenuItem value={DEFAULT_LEAVE_YEAR - 1}>
                  {DEFAULT_LEAVE_YEAR - 1}
                </MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="부여 일수"
              type="number"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              fullWidth
              slotProps={{
                htmlInput: {
                  min: GRANT_DAY_MIN,
                  max: GRANT_DAY_MAX,
                  step: GRANT_DAY_STEP,
                },
                input: {
                  endAdornment: (
                    <InputAdornment position="end">일</InputAdornment>
                  ),
                },
              }}
            />
          </Stack>

          <TextField
            label="부여 사유"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={GRANT_REASON_PLACEHOLDER}
            fullWidth
            multiline
            minRows={3}
          />

          {selected && previewTotal !== null ? (
            <Box
              sx={{
                px: 2,
                py: 1.5,
                borderRadius: 2,
                bgcolor: "#F1E8F1",
                border: "1px solid",
                borderColor: "primary.light",
              }}
            >
              <Typography variant="body2" sx={{ color: "primary.dark" }}>
                {year}년 총 부여 {formatLeaveDays(selected.balance.total_days)}일 →{" "}
                {formatLeaveDays(previewTotal)}일 · 사용 연차는 유지됩니다.
              </Typography>
            </Box>
          ) : null}

          {error ? (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          ) : null}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          variant="outlined"
          color="inherit"
          onClick={onClose}
          sx={{ borderColor: "divider", color: "text.primary" }}
        >
          취소
        </Button>
        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={handleSubmit}
        >
          연차 부여
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GrantLeaveDialog;
