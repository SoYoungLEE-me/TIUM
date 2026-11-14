import { Box, Container, Stack, Typography } from "@mui/material";
import tiumLogo from "../../assets/logo/tium-logo-dark-text.svg";
import { LANDING_SLOGAN } from "../../configs/landing/landing";
import LandingCta from "./components/LandingCta";
import LandingExamples from "./components/LandingExamples";
import LandingHeader from "./components/LandingHeader";
import LandingHero from "./components/LandingHero";

const LandingPage = () => (
  <Box
    sx={{
      minHeight: "100dvh",
      bgcolor: "background.default",
      display: "flex",
      flexDirection: "column",
      wordBreak: "keep-all", // 한글이 단어 중간에서 줄바꿈되지 않게
    }}
  >
    <LandingHeader />

    <Box component="main" sx={{ flex: 1 }}>
      <LandingHero />
      <LandingExamples />
      <LandingCta />
    </Box>

    <Box component="footer" sx={{ borderTop: 1, borderColor: "divider" }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
          }}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <Box
              component="img"
              src={tiumLogo}
              alt="TIUM"
              sx={{ height: 24, width: "auto", display: "block" }}
            />
            <Typography variant="body2" color="text.secondary">
              {LANDING_SLOGAN}
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} TIUM
          </Typography>
        </Stack>
      </Container>
    </Box>
  </Box>
);

export default LandingPage;
