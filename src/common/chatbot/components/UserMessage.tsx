import { Box, Typography } from "@mui/material";

type UserMessageProps = {
  text: string;
};

const UserMessage = ({ text }: UserMessageProps) => {
  return (
    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
      <Box
        sx={{
          maxWidth: "80%",
          bgcolor: "secondary.main",
          color: "text.primary",
          px: 1.75,
          py: 1.25,
          borderRadius: "16px 16px 4px 16px",
        }}
      >
        <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
          {text}
        </Typography>
      </Box>
    </Box>
  );
};

export default UserMessage;
