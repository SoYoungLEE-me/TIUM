import { Box, Paper, Skeleton, Stack } from "@mui/material";
import type { SkeletonCountProps } from "../../../models/skeleton/skeleton";
import { repeat } from "./repeat";

export const SkeletonListRows = ({ count = 6 }: SkeletonCountProps) => (
  <Paper
    variant="outlined"
    sx={{
      height: "100%",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    }}
  >
    <Box sx={{ px: 2, pt: 1.5, pb: 1 }}>
      <Skeleton variant="text" width={140} height={28} sx={{ mb: 1 }} />
      <Stack direction="row" spacing={1}>
        {repeat(4, (index) => (
          <Skeleton
            key={index}
            variant="rounded"
            width={88}
            height={32}
            sx={{ borderRadius: 999 }}
          />
        ))}
      </Stack>
    </Box>
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={1}
      sx={{ p: 1.5, borderBottom: "1px solid", borderColor: "divider" }}
    >
      <Skeleton variant="rounded" height={40} sx={{ flex: 1 }} />
      <Skeleton variant="rounded" width={140} height={40} />
    </Stack>
    <Box>
      {repeat(count, (index) => (
        <Stack
          key={index}
          direction="row"
          spacing={1.25}
          sx={{
            alignItems: "center",
            px: 2,
            py: 1.5,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Skeleton variant="circular" width={36} height={36} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Skeleton variant="text" width="40%" height={18} />
            <Skeleton variant="text" width="55%" height={14} />
          </Box>
          <Skeleton
            variant="text"
            width={72}
            height={18}
            sx={{ display: { xs: "none", sm: "block" } }}
          />
          <Skeleton
            variant="rounded"
            width={64}
            height={24}
            sx={{ borderRadius: 999 }}
          />
        </Stack>
      ))}
    </Box>
  </Paper>
);
