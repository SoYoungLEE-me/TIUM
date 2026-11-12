import { Box, Skeleton, Stack } from "@mui/material";
import type { SkeletonPageHeaderProps } from "../../../models/skeleton/skeleton";

export const SkeletonPageHeader = ({
  withAction = false,
}: SkeletonPageHeaderProps) => (
  <Stack
    direction={{ xs: "column", sm: "row" }}
    spacing={2}
    sx={{
      mb: 2.5,
      alignItems: { xs: "stretch", sm: "flex-start" },
      justifyContent: "space-between",
    }}
  >
    <Box sx={{ minWidth: 0, flex: 1 }}>
      <Skeleton variant="text" width="40%" height={36} sx={{ mb: 0.75 }} />
      <Skeleton variant="text" width="70%" height={22} />
    </Box>
    {withAction ? (
      <Skeleton
        variant="rounded"
        width={120}
        height={40}
        sx={{ borderRadius: 999, flexShrink: 0 }}
      />
    ) : null}
  </Stack>
);
