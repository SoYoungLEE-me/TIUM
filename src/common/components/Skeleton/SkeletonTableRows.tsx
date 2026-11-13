import { Box, Skeleton, Stack } from "@mui/material";
import type { SkeletonCountProps } from "../../../models/skeleton/skeleton";
import { repeat } from "./repeat";

export const SkeletonTableRows = ({ count = 6 }: SkeletonCountProps) => (
  <Box>
    {repeat(count, (index) => (
      <Box
        key={index}
        sx={{
          display: "grid",
          gridTemplateColumns:
            "minmax(180px, 1.6fr) 88px 56px 56px 56px 72px 96px 120px",
          columnGap: 1.5,
          alignItems: "center",
          minWidth: 900,
          px: 2.5,
          py: 1.75,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
          <Skeleton variant="circular" width={36} height={36} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Skeleton variant="text" width="55%" height={18} />
            <Skeleton variant="text" width="75%" height={14} />
          </Box>
        </Stack>
        <Skeleton variant="text" width="80%" height={18} />
        <Skeleton variant="text" width="70%" height={18} />
        <Skeleton variant="text" width="70%" height={18} />
        <Skeleton variant="text" width="70%" height={18} />
        <Skeleton variant="text" width="70%" height={18} />
        <Box>
          <Skeleton variant="text" width={48} height={18} sx={{ mb: 0.5 }} />
          <Skeleton variant="rounded" width="100%" height={6} />
        </Box>
        <Stack direction="row" spacing={1} sx={{ justifyContent: "center" }}>
          <Skeleton variant="rounded" width={52} height={30} />
          <Skeleton variant="rounded" width={52} height={30} />
        </Stack>
      </Box>
    ))}
  </Box>
);
