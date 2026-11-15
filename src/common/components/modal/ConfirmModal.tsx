import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

export type ConfirmModalProps = {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: "primary" | "error" | "inherit";
  /** 챗봇 패널 등 부모 안에 렌더할 때 portal 비활성 */
  disablePortal?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const ConfirmModal = ({
  open,
  title = "확인",
  message,
  confirmLabel = "예",
  cancelLabel = "아니오",
  confirmColor = "primary",
  disablePortal = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) => {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      disablePortal={disablePortal}
      maxWidth="xs"
      fullWidth
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-description"
      slotProps={{
        paper: {
          sx: {
            borderRadius: 2,
            boxShadow: "0 12px 40px rgba(33, 27, 34, 0.2)",
          },
        },
      }}
    >
      <DialogTitle id="confirm-modal-title" sx={{ fontWeight: 700, pb: 1 }}>
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText
          id="confirm-modal-description"
          sx={{ color: "text.primary", fontSize: 14 }}
        >
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 2.5, pb: 2, gap: 1 }}>
        <Button onClick={onCancel} color="inherit" variant="outlined">
          {cancelLabel}
        </Button>
        <Button onClick={onConfirm} color={confirmColor} variant="contained" autoFocus>
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmModal;
