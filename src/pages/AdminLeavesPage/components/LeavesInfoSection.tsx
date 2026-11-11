import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Alert, Paper, Stack, Typography } from "@mui/material";
import {
  LEAVES_CONCEPT_CARDS,
  LEAVES_PENDING_INFO,
} from "../../../configs/admin/leaves";

const LeavesInfoSection = () => {
  return (
    <Stack spacing={2} sx={{ mt: 2.5 }}>
      <Alert
        severity="info"
        icon={<InfoOutlinedIcon fontSize="inherit" />}
        sx={{
          bgcolor: "#F1E8F1",
          color: "text.primary",
          border: "1px solid",
          borderColor: "divider",
          "& .MuiAlert-icon": { color: "primary.main" },
        }}
      >
        {LEAVES_PENDING_INFO}
      </Alert>

      <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
        {LEAVES_CONCEPT_CARDS.map((card) => (
          <Paper
            key={card.id}
            variant="outlined"
            sx={{ flex: 1, p: 2 }}
          >
            <Typography sx={{ fontWeight: 700, mb: 0.75 }}>
              {card.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {card.description}
            </Typography>
          </Paper>
        ))}
      </Stack>
    </Stack>
  );
};

export default LeavesInfoSection;
