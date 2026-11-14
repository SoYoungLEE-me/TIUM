import { Box, Skeleton, Stack } from "@mui/material";
import type { SkeletonCountProps } from "../../../models/skeleton/skeleton";
import { repeat } from "./repeat";

export const SkeletonSwitchRow = ({ count = 4 }: SkeletonCountProps) => (
  <Stack>
    {repeat(count, (index) => (
      <Stack
        key={index}
        direction="row"
        spacing={2}
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
          py: 1.75,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Skeleton variant="text" width="40%" height={20} sx={{ mb: 0.25 }} />
          <Skeleton variant="text" width="65%" height={16} />
        </Box>
        <Skeleton
          variant="rounded"
          width={46}
          height={28}
          sx={{ borderRadius: 999 }}
        />
      </Stack>
    ))}
  </Stack>
);
