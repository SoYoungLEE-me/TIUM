import { Box, Paper, Skeleton, Stack } from "@mui/material";
import {
  SkeletonCalendarGrid,
  SkeletonInfoRows,
  SkeletonPageHeader,
  SkeletonStatCards,
} from "../../../common/components/Skeleton";

const AttendanceSkeleton = () => (
  <Box aria-busy aria-label="근태 관리 로딩 중">
    <SkeletonPageHeader />

    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* 정상 출근 · 지각 · 연차 사용 */}
      <SkeletonStatCards count={3} inline />

      {/* 캘린더 + 날짜 상세 */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) 340px" },
          gap: 2,
          alignItems: "start",
        }}
      >
        <Paper
          sx={{
            p: { xs: 2, md: 2.5 },
            display: "flex",
            flexDirection: "column",
            gap: 2,
            minWidth: 0,
          }}
        >
          {/* 월 이동 + 범례 */}
          <Stack
            direction="row"
            sx={{ alignItems: "center", justifyContent: "space-between" }}
          >
            <Skeleton variant="text" width={180} height={40} />
            <Skeleton
              variant="text"
              width={260}
              height={20}
              sx={{ display: { xs: "none", md: "block" } }}
            />
          </Stack>
          <SkeletonCalendarGrid count={5} />
        </Paper>

        {/* 날짜 상세 */}
        <Paper sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
          <Stack direction="row" sx={{ justifyContent: "space-between" }}>
            <Skeleton variant="text" width={120} height={28} />
            <Skeleton
              variant="rounded"
              width={56}
              height={24}
              sx={{ borderRadius: 999 }}
            />
          </Stack>
          <SkeletonInfoRows count={4} />
          <Skeleton
            variant="rounded"
            height={52}
            sx={{ borderRadius: "14px" }}
          />
        </Paper>
      </Box>
    </Box>
  </Box>
);

export default AttendanceSkeleton;
