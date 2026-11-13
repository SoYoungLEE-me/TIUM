import { Box, Button, Container, Stack } from "@mui/material";
import { Link } from "react-router";
import tiumLogo from "../../../assets/logo/tium-logo-dark-text.svg";

const LandingHeader = () => (
  <Box
    component="header"
    sx={{
      position: "sticky",
      top: 0,
      zIndex: 10,
      bgcolor: "background.default",
    }}
  >
    <Container maxWidth="lg">
      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
          py: { xs: 1.5, md: 2 },
        }}
      >
        <Box
          component={Link}
          to="/"
          aria-label="TIUM 홈"
          sx={{ display: "flex", alignItems: "center" }}
        >
          <Box
            component="img"
            src={tiumLogo}
            alt="TIUM"
            sx={{ height: { xs: 30, md: 36 }, width: "auto", display: "block" }}
          />
        </Box>
        <Button component={Link} to="/login" variant="contained">
          로그인
        </Button>
      </Stack>
    </Container>
  </Box>
);

export default LandingHeader;
