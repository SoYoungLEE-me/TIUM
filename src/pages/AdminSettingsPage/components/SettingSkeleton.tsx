import { Box, Skeleton, Stack } from "@mui/material";
import {
  SkeletonFieldRow,
  SkeletonFormCard,
  SkeletonPageHeader,
} from "../../../common/components/Skeleton";
import { ADMIN_SETTINGS_MAX_WIDTH } from "../../../configs/admin/setting";

const ruleRowSx = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 2,
  py: 1.75,
  borderBottom: "1px solid",
  borderColor: "divider",
} as const;

/** 항상 적용 규칙 행 (텍스트 + 우측 라벨 자리) */
const AlwaysOnRuleSkeleton = () => (
  <Box sx={ruleRowSx}>
    <Box sx={{ minWidth: 0, flex: 1 }}>
      <Skeleton variant="text" width="36%" height={22} sx={{ mb: 0.25 }} />
      <Skeleton variant="text" width="72%" height={18} />
    </Box>
    <Skeleton variant="text" width={56} height={20} sx={{ flexShrink: 0 }} />
  </Box>
);

/** 신청 기한 / 연속 한도 행 (필드 + 스위치) */
const ToggleRuleSkeleton = ({ last = false }: { last?: boolean }) => (
  <Box sx={{ ...ruleRowSx, ...(last ? { borderBottom: 0 } : {}) }}>
    <Box sx={{ minWidth: 0, flex: 1 }}>
      <Skeleton variant="text" width="40%" height={22} sx={{ mb: 0.25 }} />
      <Skeleton variant="text" width="68%" height={18} />
    </Box>
    <Stack
      direction="row"
      spacing={1.25}
      sx={{ alignItems: "center", flexShrink: 0 }}
    >
      <Skeleton variant="rounded" width={64} height={40} />
      <Skeleton variant="text" width={16} height={20} />
      <Skeleton
        variant="rounded"
        width={46}
        height={28}
        sx={{ borderRadius: 999 }}
      />
    </Stack>
  </Box>
);

const LeaveTypeHeaderSkeleton = () => (
  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: "1fr 120px 72px",
      columnGap: 2,
      alignItems: "center",
      py: 1.25,
      borderBottom: "1px solid",
      borderColor: "divider",
    }}
  >
    <Skeleton variant="text" width={40} height={18} />
    <Skeleton variant="text" width={56} height={18} sx={{ ml: "auto" }} />
    <Skeleton variant="text" width={32} height={18} sx={{ mx: "auto" }} />
  </Box>
);

const LeaveTypeRowSkeleton = () => (
  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: "1fr 120px 72px",
      columnGap: 2,
      alignItems: "center",
      py: 1.75,
      borderBottom: "1px solid",
      borderColor: "divider",
    }}
  >
    <Skeleton variant="text" width="45%" height={22} />
    <Stack
      direction="row"
      spacing={0.75}
      sx={{ alignItems: "center", justifyContent: "flex-end" }}
    >
      <Skeleton variant="rounded" width={52} height={32} sx={{ borderRadius: 1.5 }} />
      <Skeleton variant="text" width={14} height={18} />
    </Stack>
    <Box sx={{ display: "flex", justifyContent: "center" }}>
      <Skeleton
        variant="rounded"
        width={46}
        height={28}
        sx={{ borderRadius: 999 }}
      />
    </Box>
  </Box>
);

const SettingSkeleton = () => (
  <Box
    aria-busy
    aria-label="규정 설정 로딩 중"
    sx={{
      maxWidth: ADMIN_SETTINGS_MAX_WIDTH,
      mx: "auto",
      py: 2,
      pb: { xs: 12, md: 2 },
      minHeight: { md: "calc(100vh - 120px)" },
      display: "flex",
      flexDirection: "column",
    }}
  >
    <SkeletonPageHeader />

    <Stack spacing={2.5} sx={{ mb: { md: 3 } }}>
      {/* 기본 근무시간 */}
      <SkeletonFormCard>
        <Stack
          direction="row"
          spacing={2}
          sx={{
            mb: 2,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Skeleton variant="text" width={120} height={28} />
          <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
            <Skeleton variant="text" width={100} height={20} />
            <Skeleton
              variant="rounded"
              width={46}
              height={28}
              sx={{ borderRadius: 999 }}
            />
          </Stack>
        </Stack>
        <Stack spacing={2.5}>
          <SkeletonFieldRow count={2} />
          <Skeleton variant="rounded" height={56} />
        </Stack>
      </SkeletonFormCard>

      {/* 승인 규칙 */}
      <SkeletonFormCard>
        <Skeleton variant="text" width={88} height={28} sx={{ mb: 0.5 }} />
        <Skeleton variant="text" width="70%" height={18} sx={{ mb: 1.5 }} />
        <Stack>
          <AlwaysOnRuleSkeleton />
          <AlwaysOnRuleSkeleton />
          <ToggleRuleSkeleton />
          <ToggleRuleSkeleton last />
        </Stack>
      </SkeletonFormCard>

      {/* 휴가 유형 */}
      <SkeletonFormCard>
        <Skeleton variant="text" width={88} height={28} sx={{ mb: 1 }} />
        <LeaveTypeHeaderSkeleton />
        <LeaveTypeRowSkeleton />
        <LeaveTypeRowSkeleton />
        <LeaveTypeRowSkeleton />
      </SkeletonFormCard>
    </Stack>
  </Box>
);

export default SettingSkeleton;
