import { Box, Typography, keyframes } from "@mui/material";
import chatbotIcon from "../../../assets/chatbot-icon.png";

type LoadingSpinnerProps = {
  fullScreen?: boolean;
  message?: string;
};

const bounce = keyframes`
  0%, 100% { transform: translateY(0) scale(1, 1); }
  10%      { transform: translateY(0) scale(1.08, 0.92); }
  45%      { transform: translateY(-18px) scale(0.96, 1.04); }
  80%      { transform: translateY(0) scale(1.04, 0.96); }
`;

const shadow = keyframes`
  0%, 100% { transform: scaleX(1);    opacity: 0.35; }
  45%      { transform: scaleX(0.6);  opacity: 0.15; }
`;

const dot = keyframes`
  0%, 80%, 100% { opacity: 0.2; }
  40%           { opacity: 1; }
`;

const LoadingSpinner = ({
  fullScreen = false,
  message = "불러오는 중",
}: LoadingSpinnerProps) => (
  <Box
    role="status"
    aria-live="polite"
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 1.5,
      minHeight: fullScreen ? "100dvh" : "60vh",
      bgcolor: fullScreen ? "background.default" : "transparent",
    }}
  >
    <Box
      sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <Box
        component="img"
        src={chatbotIcon}
        alt=""
        aria-hidden="true"
        sx={{
          width: 64,
          height: 64,
          objectFit: "contain",
          transformOrigin: "center bottom",
          animation: `${bounce} 1s ease-in-out infinite`,
          "@media (prefers-reduced-motion: reduce)": { animation: "none" },
        }}
      />
      <Box
        aria-hidden="true"
        sx={{
          width: 40,
          height: 8,
          mt: 0.5,
          borderRadius: "50%",
          bgcolor: "primary.main",
          animation: `${shadow} 1s ease-in-out infinite`,
          "@media (prefers-reduced-motion: reduce)": { animation: "none" },
        }}
      />
    </Box>

    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
      {message}
      {[0, 1, 2].map((index) => (
        <Box
          key={index}
          component="span"
          aria-hidden="true"
          sx={{
            animation: `${dot} 1.2s ${index * 0.2}s infinite`,
            "@media (prefers-reduced-motion: reduce)": {
              animation: "none",
              opacity: 1,
            },
          }}
        >
          .
        </Box>
      ))}
    </Typography>
  </Box>
);

export default LoadingSpinner;
/* 로딩 스피너 너무 깜찍해여.. */
