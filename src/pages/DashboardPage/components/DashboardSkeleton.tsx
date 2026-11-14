import { Box, Paper, Skeleton, Stack } from "@mui/material";
import {
  SkeletonCardHeader,
  SkeletonPageHeader,
} from "../../../common/components/Skeleton";
import { repeat } from "../../../common/components/Skeleton/repeat";

const DashboardSkeleton = () => (
  <Box aria-busy aria-label="대시보드 로딩 중">
    <SkeletonPageHeader withAction />

    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* 출퇴근 + 내 연차 */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
          gap: 2,
        }}
      >
        {/* 오늘 출퇴근 */}
        <Paper
          sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}
        >
          <SkeletonCardHeader />
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 1.5,
            }}
          >
            {repeat(2, (index) => (
              <Skeleton
                key={index}
                variant="rounded"
                height={108}
                sx={{ borderRadius: "14px" }}
              />
            ))}
            {repeat(2, (index) => (
              <Skeleton
                key={`button-${index}`}
                variant="rounded"
                height={46}
                sx={{ borderRadius: 999 }}
              />
            ))}
          </Box>
        </Paper>

        {/* 내 연차 */}
        <Paper
          sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2.25 }}
        >
          <SkeletonCardHeader />
          <Skeleton variant="text" width="45%" height={56} />
          <Skeleton variant="rounded" height={10} sx={{ borderRadius: 999 }} />
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 1.5,
            }}
          >
            {repeat(3, (index) => (
              <Box key={index}>
                <Skeleton variant="text" width={48} height={20} />
                <Skeleton variant="text" width={56} height={30} />
              </Box>
            ))}
          </Box>
        </Paper>
      </Box>

      {/* 최근 연차 신청 */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ pb: 1.5 }}>
          <SkeletonCardHeader />
        </Box>
        {repeat(3, (index) => (
          <Stack
            key={index}
            direction="row"
            spacing={1.5}
            sx={{
              alignItems: "center",
              py: 1.75,
              borderTop: 1,
              borderColor: "divider",
            }}
          >
            <Skeleton
              variant="rounded"
              width={44}
              height={44}
              sx={{ borderRadius: "12px", flexShrink: 0 }}
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Skeleton variant="text" width="30%" height={22} />
              <Skeleton variant="text" width="60%" height={18} />
            </Box>
            <Skeleton
              variant="rounded"
              width={60}
              height={24}
              sx={{ borderRadius: 999, flexShrink: 0 }}
            />
          </Stack>
        ))}
      </Paper>
    </Box>
  </Box>
);

export default DashboardSkeleton;
