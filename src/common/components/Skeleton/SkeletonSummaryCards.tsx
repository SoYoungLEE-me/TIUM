import { Box, Paper, Skeleton } from "@mui/material";
import type { SkeletonCountProps } from "../../../models/skeleton/skeleton";
import { repeat } from "./repeat";

export const SkeletonSummaryCards = ({ count = 3 }: SkeletonCountProps) => (
  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
      gap: { xs: 1, sm: 1.5 },
      mb: 2.5,
    }}
  >
    {repeat(count, (index) => (
      <Paper
        key={index}
        variant="outlined"
        sx={{
          p: { xs: 1.25, sm: 2 },
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          minWidth: 0,
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Skeleton variant="text" width="70%" height={18} sx={{ mb: 0.75 }} />
          <Skeleton variant="text" width="50%" height={28} />
          <Skeleton
            variant="text"
            width="80%"
            height={16}
            sx={{ mt: 0.75, display: { xs: "none", md: "block" } }}
          />
        </Box>
        <Skeleton
          variant="rounded"
          width={44}
          height={44}
          sx={{ display: { xs: "none", sm: "block" }, flexShrink: 0 }}
        />
      </Paper>
    ))}
  </Box>
);
