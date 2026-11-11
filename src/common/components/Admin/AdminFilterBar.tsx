import type { ReactNode } from "react";
import { Stack, TextField } from "@mui/material";

type AdminFilterBarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  children?: ReactNode;
};

const AdminFilterBar = ({
  search,
  onSearchChange,
  searchPlaceholder = "검색",
  children,
}: AdminFilterBarProps) => {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={1.5}
      sx={{ mb: 2, alignItems: { xs: "stretch", sm: "center" } }}
    >
      <TextField
        size="small"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={searchPlaceholder}
        sx={{ minWidth: { sm: 220 }, flex: { sm: 1 }, maxWidth: { sm: 320 } }}
      />
      {children}
    </Stack>
  );
};

export default AdminFilterBar;
