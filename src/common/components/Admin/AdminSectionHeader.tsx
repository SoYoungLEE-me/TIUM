import type { ReactNode } from "react";
import { Box, Stack, Typography } from "@mui/material";

type AdminSectionHeaderProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

const AdminSectionHeader = ({
  title,
  description,
  action,
}: AdminSectionHeaderProps) => {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={2}
      sx={{
        mb: 2.5,
        alignItems: { xs: "stretch", sm: "flex-start" },
        justifyContent: "space-between",
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="h1"
          component="h1"
          sx={{ mb: description ? 0.75 : 0 }}
        >
          {title}
        </Typography>
        {description ? (
          <Typography variant="body1" color="text.secondary">
            {description}
          </Typography>
        ) : null}
      </Box>
      {action ? <Box sx={{ flexShrink: 0 }}>{action}</Box> : null}
    </Stack>
  );
};

export default AdminSectionHeader;
