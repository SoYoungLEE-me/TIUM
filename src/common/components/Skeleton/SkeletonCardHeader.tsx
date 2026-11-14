import { Skeleton, Stack } from "@mui/material";
import type { SkeletonCardHeaderProps } from "../../../models/skeleton/skeleton";

export const SkeletonCardHeader = ({
  withAction = true,
}: SkeletonCardHeaderProps) => (
  <Stack
    direction="row"
    sx={{ alignItems: "center", justifyContent: "space-between" }}
  >
    <Skeleton variant="text" width={110} height={26} />
    {withAction ? <Skeleton variant="text" width={56} height={20} /> : null}
  </Stack>
);
