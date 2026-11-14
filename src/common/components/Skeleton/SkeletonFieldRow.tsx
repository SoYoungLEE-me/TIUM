import { Skeleton, Stack } from "@mui/material";
import type { SkeletonCountProps } from "../../../models/skeleton/skeleton";
import { repeat } from "./repeat";

export const SkeletonFieldRow = ({ count = 2 }: SkeletonCountProps) => (
  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
    {repeat(count, (index) => (
      <Skeleton key={index} variant="rounded" height={56} sx={{ flex: 1 }} />
    ))}
  </Stack>
);
