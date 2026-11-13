import { Paper } from "@mui/material";
import type { SkeletonFormCardProps } from "../../../models/skeleton/skeleton";

export const SkeletonFormCard = ({ children }: SkeletonFormCardProps) => (
  <Paper variant="outlined" sx={{ p: 2.5 }}>
    {children}
  </Paper>
);
