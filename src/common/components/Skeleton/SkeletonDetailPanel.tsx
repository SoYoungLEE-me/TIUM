import { Box, Paper, Skeleton, Stack } from "@mui/material";
import { repeat } from "./repeat";

export const SkeletonDetailPanel = () => (
  <Paper
    variant="outlined"
    sx={{
      height: "100%",
      minHeight: 320,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    }}
  >
    <Stack
      direction="row"
      spacing={1}
      sx={{
        px: 2,
        py: 1.5,
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Skeleton variant="text" width={80} height={20} />
      <Skeleton
        variant="rounded"
        width={72}
        height={24}
        sx={{ borderRadius: 999 }}
      />
    </Stack>

    <Box sx={{ p: 2, flex: 1 }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 2 }}>
        <Skeleton variant="circular" width={44} height={44} />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="50%" height={22} />
          <Skeleton variant="text" width="75%" height={16} />
        </Box>
      </Stack>

      {repeat(5, (index) => (
        <Stack
          key={index}
          direction="row"
          sx={{ justifyContent: "space-between", py: 0.75 }}
        >
          <Skeleton variant="text" width={72} height={18} />
          <Skeleton variant="text" width="45%" height={18} />
        </Stack>
      ))}

      <Skeleton variant="rounded" height={72} sx={{ mt: 2, mb: 2 }} />

      <Skeleton variant="rounded" height={88} sx={{ mb: 2 }} />

      <Stack direction="row" spacing={1.25}>
        <Skeleton
          variant="rounded"
          height={40}
          sx={{ flex: 1, borderRadius: 999 }}
        />
        <Skeleton
          variant="rounded"
          height={40}
          sx={{ flex: 1, borderRadius: 999 }}
        />
      </Stack>
    </Box>
  </Paper>
);
