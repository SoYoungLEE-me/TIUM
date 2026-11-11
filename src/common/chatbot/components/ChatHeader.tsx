import CloseIcon from "@mui/icons-material/Close";
import { Box, Button, IconButton, Typography } from "@mui/material";
import chatbotIcon from "../../../assets/chatbot-icon.png";

type ChatHeaderProps = {
  title: string;
  subtitle: string;
  onClose: () => void;
  onEndConversation: () => void;
};

const ChatHeader = ({
  title,
  subtitle,
  onClose,
  onEndConversation,
}: ChatHeaderProps) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        px: 2,
        py: 1.75,
        bgcolor: "primary.main",
        color: "primary.contrastText",
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          flexShrink: 0,
          bgcolor: "primary.main",
          borderRadius: 1,
          overflow: "hidden",
          border: "1px solid",
          borderColor: "rgba(255,255,255,0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          component="img"
          src={chatbotIcon}
          alt=""
          sx={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 16, lineHeight: 1.3 }}>
          {title}
        </Typography>
        <Typography sx={{ fontSize: 12, opacity: 0.9, lineHeight: 1.4 }}>
          {subtitle}
        </Typography>
      </Box>
      <Button
        size="small"
        onClick={onEndConversation}
        sx={{
          color: "primary.contrastText",
          border: "1px solid rgba(255,255,255,0.55)",
          borderRadius: 999,
          px: 1.25,
          py: 0.25,
          minWidth: 0,
          fontSize: 12,
          fontWeight: 600,
          whiteSpace: "nowrap",
          "&:hover": {
            bgcolor: "rgba(255,255,255,0.12)",
            borderColor: "rgba(255,255,255,0.8)",
          },
        }}
      >
        대화종료
      </Button>
      <IconButton
        aria-label="챗봇 닫기"
        onClick={onClose}
        size="small"
        sx={{ color: "primary.contrastText" }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </Box>
  );
};

export default ChatHeader;
