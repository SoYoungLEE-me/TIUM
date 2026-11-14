import { Box, Paper, Skeleton, Stack } from "@mui/material";
import {
  SkeletonPageHeader,
  SkeletonStatCards,
} from "../../../common/components/Skeleton";
import { repeat } from "../../../common/components/Skeleton/repeat";

const TABLE_COLUMNS = "100px 180px minmax(0, 1fr) 64px minmax(0, 1.4fr) 72px";

const LeavesSkeleton = () => (
  <Box aria-busy aria-label="연차 관리 로딩 중">
    <SkeletonPageHeader withAction />

    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* 총 부여 · 사용 · 잔여 */}
      <SkeletonStatCards count={3} />

      {/* 신청 내역 */}
      <Paper sx={{ p: { xs: 2, md: 3 } }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1.5}
          sx={{
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", md: "center" },
            mb: 2,
          }}
        >
          <Skeleton variant="text" width={80} height={28} />
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
            {repeat(5, (index) => (
              <Skeleton
                key={index}
                variant="rounded"
                width={72}
                height={36}
                sx={{ borderRadius: 999 }}
              />
            ))}
          </Stack>
        </Stack>

        {/* 데스크톱 표 */}
        <Box sx={{ display: { xs: "none", md: "block" } }}>
          {repeat(6, (index) => (
            <Box
              key={index}
              sx={{
                display: "grid",
                gridTemplateColumns: TABLE_COLUMNS,
                columnGap: 2,
                alignItems: "center",
                px: 2,
                py: 2,
              }}
            >
              <Skeleton variant="text" width="80%" height={20} />
              <Skeleton variant="text" width="75%" height={20} />
              <Box>
                <Skeleton variant="text" width="30%" height={20} />
                <Skeleton variant="text" width="60%" height={18} />
              </Box>
              <Skeleton variant="text" width={32} height={20} />
              <Skeleton variant="text" width="70%" height={20} />
              <Skeleton
                variant="rounded"
                width={56}
                height={24}
                sx={{ borderRadius: 999 }}
              />
            </Box>
          ))}
        </Box>

        {/* 모바일 목록 */}
        <Stack spacing={1.5} sx={{ display: { xs: "flex", md: "none" } }}>
          {repeat(4, (index) => (
            <Skeleton
              key={index}
              variant="rounded"
              height={88}
              sx={{ borderRadius: "14px" }}
            />
          ))}
        </Stack>
      </Paper>
    </Box>
  </Box>
);

export default LeavesSkeleton;
