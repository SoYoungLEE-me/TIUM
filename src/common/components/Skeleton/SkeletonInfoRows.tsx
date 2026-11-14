import { Box, Skeleton, Stack } from "@mui/material";
import type { SkeletonCountProps } from "../../../models/skeleton/skeleton";
import { repeat } from "./repeat";

export const SkeletonInfoRows = ({ count = 4 }: SkeletonCountProps) => (
  <Box>
    {repeat(count, (index) => (
      <Stack
        key={index}
        direction="row"
        sx={{
          justifyContent: "space-between",
          py: 1.5,
          borderBottom: 1,
          borderColor: "divider",
          "&:last-of-type": { borderBottom: 0 },
        }}
      >
        <Skeleton variant="text" width={48} height={22} />
        <Skeleton variant="text" width={80} height={22} />
      </Stack>
    ))}
  </Box>
);
