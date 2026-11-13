import { Box, Container, Typography } from "@mui/material";
import type { Theme } from "@mui/material";
import {
  LANDING_EXAMPLES,
  type LandingExampleTone,
} from "../../../configs/landing/landing";

const TONE_BG: Record<LandingExampleTone, (theme: Theme) => string> = {
  annual: (theme) => theme.palette.secondary.main,
  half: (theme) => theme.palette.leave.half.bg,
  rule: (theme) => theme.palette.background.paper,
};

const LandingExamples = () => (
  <Box
    component="section"
    aria-labelledby="landing-examples"
    sx={(theme) => ({
      bgcolor: theme.palette.leave.approved.bg,
      py: { xs: 8, md: 12 },
      my: { xs: 8, md: 12 },
    })}
  >
    <Container maxWidth="lg">
      <Typography
        id="landing-examples"
        component="h2"
        sx={{
          fontWeight: 800,
          fontSize: { xs: 28, md: 40 },
          letterSpacing: "-0.035em",
          mb: { xs: 4, md: 6 },
        }}
      >
        이렇게 말하면 돼요
      </Typography>

      <Box
        component="dl"
        sx={{
          m: 0,
          display: "flex",
          flexDirection: "column",
          gap: { xs: 3, md: 4 },
        }}
      >
        {LANDING_EXAMPLES.map((example) => (
          <Box
            key={example.ask}
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "minmax(0, 5fr) minmax(0, 6fr)",
              },
              alignItems: "center",
              gap: { xs: 1.5, md: 6 },
            }}
          >
            <Typography
              component="dt"
              sx={(theme) => ({
                justifySelf: "start",
                px: { xs: 2, md: 2.5 },
                py: { xs: 1.25, md: 1.5 },
                borderRadius: "22px 22px 22px 6px",
                bgcolor: TONE_BG[example.tone](theme),
                fontWeight: 700,
                fontSize: { xs: 18, md: 22 },
                letterSpacing: "-0.02em",
                color: "text.primary",
              })}
            >
              {example.ask}
            </Typography>
            <Typography
              component="dd"
              sx={{
                m: 0,
                fontSize: { xs: 15, md: 17 },
                lineHeight: 1.7,
                maxWidth: 520,
              }}
            >
              {example.answer}
            </Typography>
          </Box>
        ))}
      </Box>
    </Container>
  </Box>
);

export default LandingExamples;
