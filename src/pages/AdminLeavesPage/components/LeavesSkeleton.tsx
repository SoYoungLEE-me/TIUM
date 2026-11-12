import { Box, Paper, Skeleton, Stack } from "@mui/material";
import {
  SkeletonPageHeader,
  SkeletonSummaryCards,
  SkeletonTableRows,
} from "../../../common/components/Skeleton";
import { ADMIN_LEAVES_MAX_WIDTH } from "../../../configs/admin/leaves";

const LeavesSkeleton = () => (
  <Box
    aria-busy
    aria-label="직원 연차 로딩 중"
    sx={{ maxWidth: ADMIN_LEAVES_MAX_WIDTH, mx: "auto", py: 2 }}
  >
    <SkeletonPageHeader withAction />
    <SkeletonSummaryCards count={3} />

    <Paper variant="outlined" sx={{ overflow: "hidden" }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        sx={{
          px: 2.5,
          pt: 2.25,
          pb: 1.5,
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
        }}
      >
        <Skeleton variant="text" width={180} height={28} />
        <Skeleton
          variant="rounded"
          width={72}
          height={24}
          sx={{ borderRadius: 999 }}
        />
      </Stack>

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1.5}
        sx={{ px: 2.5, pb: 1.5 }}
      >
        <Skeleton variant="rounded" width={120} height={40} />
        <Skeleton variant="rounded" width={140} height={40} />
        <Skeleton variant="rounded" height={40} sx={{ flex: 1 }} />
      </Stack>

      <Box
        sx={{
          overflowX: "auto",
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns:
              "minmax(180px, 1.6fr) 88px 56px 56px 56px 72px 96px 120px",
            columnGap: 1.5,
            alignItems: "center",
            minWidth: 900,
            px: 2.5,
            py: 1.25,
            bgcolor: "#F1E8F1",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          {Array.from({ length: 8 }, (_, index) => (
            <Skeleton key={index} variant="text" width="70%" height={16} />
          ))}
        </Box>
        <SkeletonTableRows count={6} />
      </Box>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        sx={{
          px: 2.5,
          py: 1.75,
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: "space-between",
        }}
      >
        <Skeleton variant="text" width={220} height={18} />
        <Skeleton variant="rounded" width={120} height={32} />
      </Stack>
    </Paper>
  </Box>
);

export default LeavesSkeleton;
