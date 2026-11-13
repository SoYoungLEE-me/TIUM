import { Box, Paper, Skeleton, Stack } from "@mui/material";
import type { SkeletonCountProps } from "../../../models/skeleton/skeleton";
import { repeat } from "./repeat";

export const SkeletonSummaryCards = ({ count = 3 }: SkeletonCountProps) => (
  <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ mb: 2.5 }}>
    {repeat(count, (index) => (
      <Paper
        key={index}
        variant="outlined"
        sx={{
          flex: 1,
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Skeleton variant="text" width="45%" height={18} sx={{ mb: 0.75 }} />
          <Skeleton variant="text" width="55%" height={32} sx={{ mb: 0.75 }} />
          <Skeleton variant="text" width="80%" height={16} />
        </Box>
        <Skeleton variant="rounded" width={44} height={44} />
      </Paper>
    ))}
  </Stack>
);
