import { Box, Container } from "@mui/material";
import { Outlet } from "react-router";
import Chatbot from "../common/chatbot/Chatbot";

const AppLayout = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
      }}
    >
      <Box component="main" sx={{ flex: 1, py: 3 }}>
        <Container maxWidth="xl">
          <Outlet />
        </Container>
      </Box>
      <Chatbot />
    </Box>
  );
};

export default AppLayout;
