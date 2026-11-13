import { Paper, Skeleton, Stack } from "@mui/material";

export const SkeletonActionBar = () => (
  <Paper
    variant="outlined"
    sx={{
      mt: { xs: 0, md: "auto" },
      px: 2.5,
      py: 1.5,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 2,
      flexWrap: "wrap",
    }}
  >
    <Skeleton variant="text" width={220} height={20} />
    <Stack direction="row" spacing={1.25}>
      <Skeleton variant="rounded" width={96} height={40} />
      <Skeleton variant="rounded" width={132} height={40} />
    </Stack>
  </Paper>
);
