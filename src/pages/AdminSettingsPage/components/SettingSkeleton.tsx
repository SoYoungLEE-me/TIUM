import { Box, Skeleton, Stack } from "@mui/material";
import {
  SkeletonActionBar,
  SkeletonFieldRow,
  SkeletonFormCard,
  SkeletonPageHeader,
  SkeletonSwitchRow,
} from "../../../common/components/Skeleton";
import { ADMIN_SETTINGS_MAX_WIDTH } from "../../../configs/admin/setting";

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
          <Skeleton
            variant="rounded"
            width={46}
            height={28}
            sx={{ borderRadius: 999 }}
          />
        </Stack>
        <Stack spacing={2.5}>
          <SkeletonFieldRow count={2} />
          <Skeleton variant="rounded" height={56} />
          <Stack direction="row" spacing={1}>
            {Array.from({ length: 7 }, (_, index) => (
              <Skeleton
                key={index}
                variant="rounded"
                width={40}
                height={40}
                sx={{ borderRadius: 2 }}
              />
            ))}
          </Stack>
        </Stack>
      </SkeletonFormCard>

      <SkeletonFormCard>
        <Skeleton variant="text" width={140} height={28} sx={{ mb: 1 }} />
        <SkeletonSwitchRow count={5} />
      </SkeletonFormCard>

      <SkeletonFormCard>
        <Skeleton variant="text" width={100} height={28} sx={{ mb: 1 }} />
        <SkeletonSwitchRow count={3} />
      </SkeletonFormCard>
    </Stack>

    <SkeletonActionBar />
  </Box>
);

export default SettingSkeleton;
