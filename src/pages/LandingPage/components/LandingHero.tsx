import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { Link } from "react-router";
import { LANDING_HERO } from "../../../configs/landing/landing";
import LandingDemo from "./LandingDemo";

const LandingHero = () => (
  <Container
    maxWidth="lg"
    component="section"
    aria-labelledby="landing-title"
    sx={{ pt: { xs: 4, md: 9 } }}
  >
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) 340px" },
        alignItems: "end",
        gap: { xs: 3, md: 6 },
      }}
    >
      <Typography
        id="landing-title"
        component="h1"
        sx={{
          fontWeight: 800,
          fontSize: { xs: 44, sm: 64, md: 88 },
          lineHeight: 1.05,
          letterSpacing: "-0.045em",
          color: "text.primary",
        }}
      >
        {LANDING_HERO.title[0]}
        <br />
        {LANDING_HERO.title[1]}
      </Typography>

      <Stack spacing={2.5} sx={{ pb: { md: 1.5 } }}>
        <Typography
          sx={{
            fontSize: { xs: 16, md: 17 },
            lineHeight: 1.7,
            color: "text.secondary",
          }}
        >
          {LANDING_HERO.description}
        </Typography>
        <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
          <Button component={Link} to="/login" variant="contained" size="large">
            로그인
          </Button>
          <Typography
            component={Link}
            to="/signup"
            sx={{
              fontSize: 15,
              fontWeight: 600,
              color: "text.secondary",
              textUnderlineOffset: "4px",
            }}
          >
            처음이라면 회원가입
          </Typography>
        </Stack>
      </Stack>
    </Box>

    <LandingDemo />
  </Container>
);

export default LandingHero;
