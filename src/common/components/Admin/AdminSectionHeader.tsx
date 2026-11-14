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
    <Stack spacing={0.75} sx={{ mb: 2.5 }}>
      <Stack
        direction="row"
        spacing={2}
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="h1" component="h1" sx={{ minWidth: 0 }}>
          {title}
        </Typography>
        {action ? <Box sx={{ flexShrink: 0 }}>{action}</Box> : null}
      </Stack>
      {description ? (
        <Typography variant="body1" color="text.secondary">
          {description}
        </Typography>
      ) : null}
    </Stack>
  );
};

export default AdminSectionHeader;
