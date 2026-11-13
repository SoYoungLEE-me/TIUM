import { Box, Stack } from "@mui/material";
import {
  SkeletonDetailPanel,
  SkeletonListRows,
  SkeletonPageHeader,
  SkeletonSummaryCards,
} from "../../../common/components/Skeleton";
import { ADMIN_REVIEW_MAX_WIDTH } from "../../../configs/admin/admin";

const AdminSkeleton = () => (
  <Box
    aria-busy
    aria-label="신청 검토 로딩 중"
    sx={{ maxWidth: ADMIN_REVIEW_MAX_WIDTH, mx: "auto", py: 2 }}
  >
    <SkeletonPageHeader />
    <SkeletonSummaryCards count={3} />

    <Stack
      direction={{ xs: "column", lg: "row" }}
      spacing={2}
      sx={{ alignItems: "stretch", minHeight: { lg: 640 } }}
    >
      <Box sx={{ flex: 1.55, minWidth: 0 }}>
        <SkeletonListRows count={6} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0, maxWidth: { lg: 420 } }}>
        <SkeletonDetailPanel />
      </Box>
    </Stack>
  </Box>
);

export default AdminSkeleton;
