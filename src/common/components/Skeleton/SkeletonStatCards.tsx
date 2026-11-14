import { Box, Paper, Skeleton } from "@mui/material";
import type { SkeletonStatCardsProps } from "../../../models/skeleton/skeleton";
import { repeat } from "./repeat";

export const SkeletonStatCards = ({
  count = 3,
  inline = false,
}: SkeletonStatCardsProps) => (
  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: inline
        ? `repeat(${count}, minmax(0, 1fr))`
        : { xs: "1fr", md: `repeat(${count}, minmax(0, 1fr))` },
      gap: inline ? { xs: 1, sm: 2 } : 2,
    }}
  >
    {repeat(count, (index) =>
      inline ? (
        <Paper
          key={index}
          sx={{
            p: { xs: 1.5, sm: 2 },
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <Skeleton variant="text" width={72} height={22} />
          <Skeleton variant="text" width={48} height={34} />
        </Paper>
      ) : (
        <Paper key={index} sx={{ p: 2.5 }}>
          <Skeleton variant="text" width={64} height={20} />
          <Skeleton variant="text" width={88} height={44} />
          <Skeleton variant="text" width="60%" height={20} />
        </Paper>
      )
    )}
  </Box>
);
