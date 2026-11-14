import { Box, Container, Typography } from "@mui/material";
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
        gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) 520px" },
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

      <Typography
        sx={{
          pb: { md: 3 },
          fontSize: { xs: 17, md: 20 },
          lineHeight: 1.6,
          color: "text.secondary",
        }}
      >
        {LANDING_HERO.description.map((line) => (
          <Box component="span" key={line} sx={{ display: "block" }}>
            {line}
          </Box>
        ))}
      </Typography>
    </Box>

    <LandingDemo />
  </Container>
);

export default LandingHero;
