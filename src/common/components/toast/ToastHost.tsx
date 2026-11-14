import { Alert, Box, Slide } from "@mui/material";
import { useEffect } from "react";
import { useToastStore } from "../../../stores/toastStore";

/** 사이드바(md+) 제외 — main 콘텐츠 영역 가로 기준 중앙 */
const MAIN_OFFSET_LEFT = { xs: 0, md: 256 };

/** 앱 루트에 한 번만 마운트. 최대 1개, main 하단 중앙 */
const ToastHost = () => {
  const toast = useToastStore((s) => s.toast);
  const dismiss = useToastStore((s) => s.dismiss);

  useEffect(() => {
    if (!toast || toast.duration <= 0) return;
    const timer = window.setTimeout(() => dismiss(toast.id), toast.duration);
    return () => window.clearTimeout(timer);
  }, [dismiss, toast]);

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
      {toast ? (
        <Slide key={toast.id} direction="up" in mountOnEnter unmountOnExit>
          <Alert
            severity={toast.severity}
            variant="filled"
            onClose={() => dismiss(toast.id)}
            sx={{
              pointerEvents: "auto",
              maxWidth: 440,
              width: "100%",
              boxShadow: "0 8px 24px rgba(33, 27, 34, 0.16)",
              alignItems: "center",
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
