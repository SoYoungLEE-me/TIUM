import { Box, Typography } from "@mui/material";
import type { ReactNode } from "react";
import chatbotIcon from "../../../assets/chatbot-icon.png";

type AssistantMessageProps = {
  message: string;
  children?: ReactNode;
};

const AssistantMessage = ({ message, children }: AssistantMessageProps) => {
  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
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
          display: "flex",
          flexDirection: "column",
          gap: 1,
          minWidth: 0,
          flex: 1,
        }}
      >
        <Box
          sx={{
            alignSelf: "flex-start",
            maxWidth: "100%",
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "primary.main",
            px: 1.75,
            py: 1.25,
            borderRadius: "4px 16px 16px 16px",
          }}
        >
          <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
            {message}
          </Typography>
        </Box>
        {children}
      </Box>
    </Box>
  );
};

export default AssistantMessage;
