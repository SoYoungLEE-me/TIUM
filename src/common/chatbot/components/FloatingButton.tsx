import { Box, Fab } from "@mui/material";
import chatbotIcon from "../../../assets/chatbot-icon.png";

type FloatingButtonProps = {
  visible: boolean;
  onOpen: () => void;
};

const FloatingButton = ({ visible, onOpen }: FloatingButtonProps) => {
  if (!visible) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        right: { xs: 16, sm: 24 },
        bottom: { xs: 16, sm: 24 },
        zIndex: (theme) => theme.zIndex.modal,
      }}
    >
      <Fab
        aria-label="HR 도우미 열기"
        onClick={onOpen}
        sx={{
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
    </Box>
  );
};

export default FloatingButton;
