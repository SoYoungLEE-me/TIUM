import { Alert, Box, Slide } from "@mui/material";
import { useEffect } from "react";
import { useToastStore, type ToastSeverity } from "../../../stores/toastStore";

/** 사이드바(md+) 제외 — main 콘텐츠 영역 가로 기준 중앙 */
const MAIN_OFFSET_LEFT = { xs: 0, md: 256 };

/** 테마 leave/soft 톤에 맞춘 파스텔 Toast */
const PASTEL_BY_SEVERITY: Record<
  ToastSeverity,
  { bg: string; fg: string; icon: string }
> = {
  success: { bg: "#E7F1E3", fg: "#3F6E3A", icon: "#3F6E3A" },
  warning: { bg: "#FAF6DD", fg: "#6B5D10", icon: "#6B5D10" },
  info: { bg: "#E2F2EC", fg: "#2F7A65", icon: "#2F7A65" },
  error: { bg: "#F8E1DC", fg: "#A8402F", icon: "#A8402F" },
};

/** 앱 루트에 한 번만 마운트. 최대 1개, main 하단 중앙 */
const ToastHost = () => {
  const toast = useToastStore((s) => s.toast);
  const dismiss = useToastStore((s) => s.dismiss);

  useEffect(() => {
    if (!toast || toast.duration <= 0) return;
    const timer = window.setTimeout(() => dismiss(toast.id), toast.duration);
    return () => window.clearTimeout(timer);
  }, [dismiss, toast]);

  const pastel = toast ? PASTEL_BY_SEVERITY[toast.severity] : null;

  return (
    <Box
      data-toast-host
      sx={{
        position: "fixed",
        left: MAIN_OFFSET_LEFT,
        right: 0,
        bottom: 28,
        zIndex: (theme) => theme.zIndex.snackbar,
        display: "flex",
        justifyContent: "center",
        px: 2,
        pointerEvents: "none",
      }}
    >
      {toast && pastel ? (
        <Slide key={toast.id} direction="up" in mountOnEnter unmountOnExit>
          <Alert
            severity={toast.severity}
            variant="standard"
            onClose={() => dismiss(toast.id)}
            sx={{
              pointerEvents: "auto",
              maxWidth: 440,
              width: "100%",
              bgcolor: pastel.bg,
              color: pastel.fg,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 3,
              boxShadow: "0 8px 24px rgba(33, 27, 34, 0.1)",
              alignItems: "center",
              "& .MuiAlert-icon": { color: pastel.icon },
              "& .MuiAlert-message": {
                color: pastel.fg,
                fontWeight: 600,
                fontSize: 14,
                lineHeight: 1.45,
              },
              "& .MuiAlert-action .MuiIconButton-root": {
                color: pastel.fg,
                opacity: 0.72,
                "&:hover": { opacity: 1, bgcolor: "transparent" },
              },
            }}
          >
            {toast.message}
          </Alert>
        </Slide>
      ) : null}
    </Box>
  );
};

export default ToastHost;
