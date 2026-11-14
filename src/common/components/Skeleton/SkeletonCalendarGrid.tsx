import { Box, Skeleton } from "@mui/material";
import type { SkeletonCountProps } from "../../../models/skeleton/skeleton";
import { repeat } from "./repeat";

export const SkeletonCalendarGrid = ({ count = 5 }: SkeletonCountProps) => (
  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
      gap: { xs: 0.5, sm: 1 },
    }}
  >
    {repeat(count * 7, (index) => (
      <Skeleton
        key={index}
        variant="rounded"
        sx={{
          height: { xs: 44, sm: 64, md: 72 },
          borderRadius: { xs: "10px", sm: "12px" },
        }}
      />
    ))}
  </Box>
);
