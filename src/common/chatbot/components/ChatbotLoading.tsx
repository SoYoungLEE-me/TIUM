import { Box, keyframes } from "@mui/material";
import chatbotIcon from "../../../assets/chatbot-icon.png";

const bounce = keyframes`
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-4px);
    opacity: 1;
  }
`;

const ChatbotLoading = () => {
  return (
    <Box
      sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}
      aria-label="답변 생성 중"
      aria-live="polite"
    >
      <Box
        sx={{
          width: 28,
          height: 28,
          mt: 0.5,
          flexShrink: 0,
          bgcolor: "primary.main",
          borderRadius: 1,
          overflow: "hidden",
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
      <Box
        sx={{
          alignSelf: "flex-start",
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "primary.main",
          px: 1.75,
          py: 1.5,
          borderRadius: "4px 16px 16px 16px",
          display: "flex",
          alignItems: "center",
          gap: 0.75,
          minHeight: 40,
        }}
      >
        {[0, 1, 2].map((index) => (
          <Box
            key={index}
            sx={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              bgcolor: "primary.main",
              animation: `${bounce} 1.1s ease-in-out infinite`,
              animationDelay: `${index * 0.16}s`,
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default ChatbotLoading;
