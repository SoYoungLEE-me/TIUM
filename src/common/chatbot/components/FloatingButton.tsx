import { Box, Fab } from "@mui/material";
import chatbotIcon from "../../../assets/chatbot-icon.png";

type FloatingButtonProps = {
  visible: boolean;
  onOpen: () => void;
  badge?: number;
};

const FloatingButton = ({
  visible,
  onOpen,
  badge = 0,
}: FloatingButtonProps) => {
  if (!visible) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        right: { xs: 16, sm: 24 },
        bottom: { xs: 16, sm: 24 },
        zIndex: (theme) => theme.zIndex.tooltip + 1,
      }}
    >
      <Box sx={{ position: "relative", display: "inline-flex" }}>
        <Fab
          aria-label="HR 도우미 열기"
          onClick={onOpen}
          sx={{
            position: "relative",
            zIndex: 1,
            width: 64,
            height: 64,
            bgcolor: "primary.main",
            "&:hover": { bgcolor: "primary.dark" },
            boxShadow: "0 10px 28px rgba(116, 69, 119, 0.35)",
          }}
        >
          <Box
            component="img"
            src={chatbotIcon}
            alt=""
            sx={{ width: 40, height: 40, objectFit: "contain" }}
          />
        </Fab>
        {badge > 0 ? (
          <Box
            aria-hidden
            component="span"
            sx={{
              position: "absolute",
              top: 0,
              right: 0,
              zIndex: 2,
              minWidth: 20,
              height: 20,
              px: 0.5,
              borderRadius: "10px",
              bgcolor: "error.main",
              color: "error.contrastText",
              fontSize: 12,
              fontWeight: 700,
              lineHeight: "20px",
              textAlign: "center",
              // 기본(우상단)보다 살짝 아래·왼쪽
              transform: "translate(12%, -8%)",
              boxShadow: 1,
              pointerEvents: "none",
            }}
          >
            {badge > 99 ? "99+" : badge}
          </Box>
        ) : null}
      </Box>
    </Box>
  );
};

export default FloatingButton;
