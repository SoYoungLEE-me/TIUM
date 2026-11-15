import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import { useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { toast } from "../../../common/components/toast";
import {
  INVITE_DEPARTMENT_PLACEHOLDER,
  INVITE_DIALOG_DESCRIPTION,
  INVITE_DIALOG_TITLE,
  INVITE_ERROR,
  INVITE_NOTICE,
  INVITE_SUCCESS,
} from "../../../configs/admin/invite";
import { useCreateEmployee } from "../../../hooks/apis/useAdminEmployees";
import {
  isValidEmail,
  toInviteErrorMessage,
} from "../../../utils/admin/invite";

type InviteEmployeeDialogProps = {
  open: boolean;
  /* 부서 자동완성 목록 (기존 직원 부서) */
  departments: string[];
  onClose: () => void;
};

const InviteEmployeeDialog = ({
  open,
  departments,
  onClose,
}: InviteEmployeeDialogProps) => {
  const createEmployee = useCreateEmployee();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [error, setError] = useState<string | null>(null);

  const resetAndClose = () => {
    setFullName("");
    setEmail("");
    setDepartment("");
    setError(null);
    onClose();
  };

  const handleSubmit = () => {
    const name = fullName.trim();
    const mail = email.trim().toLowerCase();

    if (!name || !mail) {
      setError(INVITE_ERROR.required);
      return;
    }
    if (!isValidEmail(mail)) {
      setError(INVITE_ERROR.email);
      return;
    }

    setError(null);
    createEmployee.mutate(
      { full_name: name, email: mail, department: department.trim() || null },
      {
        onSuccess: () => {
          toast.success(INVITE_SUCCESS(name));
          resetAndClose();
        },
        onError: (err) => setError(toInviteErrorMessage(err)),
      }
    );
  };

  return (
    <Dialog
      open={open}
      onClose={createEmployee.isPending ? undefined : resetAndClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle sx={{ pr: 6 }}>
        <Typography component="span" sx={{ fontWeight: 700 }}>
          {INVITE_DIALOG_TITLE}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {INVITE_DIALOG_DESCRIPTION}
        </Typography>
        <IconButton
          aria-label="닫기"
          onClick={resetAndClose}
          disabled={createEmployee.isPending}
          sx={{ position: "absolute", right: 12, top: 12 }}
        >
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2.25}>
          <TextField
            label="이름"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            fullWidth
          />
          <TextField
            label="이메일"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
          />
          <Autocomplete
            freeSolo
            options={departments}
            inputValue={department}
            onInputChange={(_, value) => setDepartment(value)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="부서"
                placeholder={INVITE_DEPARTMENT_PLACEHOLDER}
              />
            )}
          />

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
              {INVITE_NOTICE}
            </Typography>
          </Box>

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
          onClick={resetAndClose}
          disabled={createEmployee.isPending}
          sx={{ borderColor: "divider", color: "text.primary" }}
        >
          취소
        </Button>
        <Button
          variant="contained"
          startIcon={<SendRoundedIcon />}
          onClick={handleSubmit}
          disabled={createEmployee.isPending}
        >
          {createEmployee.isPending ? "보내는 중" : "초대 메일 보내기"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InviteEmployeeDialog;
