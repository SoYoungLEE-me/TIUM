import { useState } from "react";
import type { MouseEvent } from "react";
import {
  AppBar,
  Avatar,
  Box,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from "@mui/material";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";

import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";

interface NavbarProps {
  showMenuButton: boolean;
  onMenuClick: () => void;
}

// TODO: Supabase 연결 후 실제 유저 정보로 교체
const user = {
  full_name: "이소영",
  email: "minji.kim@company.com",
  role: "employee" as "employee" | "hr_admin",
  department: "개발팀" as string | null,
};

const Navbar = ({ showMenuButton, onMenuClick }: NavbarProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (e: MouseEvent<HTMLElement>) =>
    setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleClose();
    // TODO: 로그아웃 처리 후 /login 이동
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "background.default",
        color: "text.primary",
        border: 0,
        borderRadius: 0,
      }}
    >
      <Toolbar
        sx={{ gap: 1.5, px: { xs: 2, md: 3 }, minHeight: { xs: 64, md: 72 } }}
      >
        {showMenuButton && (
          <IconButton edge="start" aria-label="메뉴 열기" onClick={onMenuClick}>
            <MenuRoundedIcon />
          </IconButton>
        )}

        <Box sx={{ flex: 1 }} />

        <IconButton
          onClick={handleOpen}
          aria-label="계정 메뉴"
          aria-controls={open ? "account-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          sx={{ p: 0.5 }}
        >
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: "warning.light",
              color: "#5E531A",
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            {user.full_name.slice(0, 1)}
          </Avatar>
        </IconButton>

        <Menu
          id="account-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          slotProps={{
            paper: { sx: { mt: 1, minWidth: 220, borderRadius: "14px" } },
          }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography sx={{ fontWeight: 700 }}>{user.full_name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {user.department ?? "부서 미지정"} ·{" "}
              {user.role === "hr_admin" ? "인사 관리자" : "직원"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user.email}
            </Typography>
          </Box>

          <Divider />

          <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
            <ListItemIcon sx={{ color: "inherit" }}>
              <LogoutRoundedIcon fontSize="small" />
            </ListItemIcon>
            로그아웃
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
