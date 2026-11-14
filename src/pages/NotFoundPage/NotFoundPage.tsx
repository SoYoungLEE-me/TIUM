import { Box, Button, Stack, Typography } from "@mui/material";
import { Link, useNavigate } from "react-router";
import chatbotIcon from "../../assets/chatbot-icon.png";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Box
      component="main"
      sx={{
        minHeight: "100dvh",
        bgcolor: "background.default",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
      }}
    >
      <Stack
        spacing={2.5}
        sx={{ alignItems: "center", textAlign: "center", maxWidth: 420 }}
      >
        <Box
          component="img"
          src={chatbotIcon}
          alt=""
          aria-hidden="true"
          sx={{ width: 96, height: 96, objectFit: "contain" }}
        />

        <Typography
          component="p"
          sx={{
            fontSize: { xs: 56, md: 72 },
            fontWeight: 800,
            lineHeight: 1,
            color: "primary.main",
          }}
        >
          404
        </Typography>

        <Box>
          <Typography
            variant="h1"
            component="h1"
            sx={{ fontSize: { xs: 22, md: 26 } }}
          >
            페이지를 찾을 수 없어요
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1, lineHeight: 1.7 }}>
            주소가 바뀌었거나 없는 페이지예요.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.25} sx={{ pt: 1 }}>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            onClick={() => navigate(-1)}
          >
            이전 페이지
          </Button>
          <Button component={Link} to="/" variant="contained" size="large">
            홈으로
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default NotFoundPage;
