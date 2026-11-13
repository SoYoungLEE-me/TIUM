import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { Link } from "react-router";
import { LANDING_CTA } from "../../../configs/landing/landing";

const LandingCta = () => (
  <Container
    maxWidth="lg"
    component="section"
    aria-labelledby="landing-cta"
    sx={{ pb: { xs: 6, md: 10 } }}
  >
    <Box
      sx={{
        px: { xs: 3, md: 7 },
        py: { xs: 5, md: 7 },
        borderRadius: { xs: "24px", md: "32px" },
        bgcolor: "primary.main",
        color: "primary.contrastText",
      }}
    >
      <Typography
        id="landing-cta"
        component="h2"
        sx={{
          fontWeight: 800,
          fontSize: { xs: 28, md: 44 },
          lineHeight: 1.2,
          letterSpacing: "-0.035em",
          color: "inherit",
          maxWidth: 560,
        }}
      >
        {LANDING_CTA.title}
      </Typography>
      <Typography
        sx={{
          mt: 1.5,
          fontSize: { xs: 15, md: 17 },
          lineHeight: 1.7,
          color: "inherit",
          opacity: 0.8,
        }}
      >
        {LANDING_CTA.description}
      </Typography>

      <Stack
        direction="row"
        spacing={2}
        sx={{ alignItems: "center", mt: { xs: 3, md: 4 } }}
      >
        <Button
          component={Link}
          to="/login"
          variant="contained"
          color="secondary"
          size="large"
          sx={{ border: 0 }}
        >
          로그인
        </Button>
        <Typography
          component={Link}
          to="/signup"
          sx={{
            fontSize: 15,
            fontWeight: 600,
            color: "inherit",
            opacity: 0.85,
            textUnderlineOffset: "4px",
          }}
        >
          처음이라면 회원가입
        </Typography>
      </Stack>
    </Box>
  </Container>
);

export default LandingCta;
