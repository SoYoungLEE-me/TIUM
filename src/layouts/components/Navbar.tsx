import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
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
import tiumLogo from "../../assets/logo/tium-logo-dark-text.svg";
import { useMe } from "../../hooks/apis/useMe";
import { useAuthStore } from "../../stores/authStore";
import { getAvatarInitial } from "../../utils/profile/avatar";

interface NavbarProps {
  showMenuButton: boolean;
  onMenuClick: () => void;
}

const Navbar = ({ showMenuButton, onMenuClick }: NavbarProps) => {
  const { data: me } = useMe();
  const signOut = useAuthStore((state) => state.signOut);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (e: MouseEvent<HTMLElement>) =>
    setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = async () => {
    handleClose();
    await signOut();
    // 이전 사용자의 조회 결과가 남지 않도록 비우기
    queryClient.clear();
    navigate("/login", { replace: true });
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
          <>
            <IconButton
              edge="start"
              aria-label="메뉴 열기"
              onClick={onMenuClick}
            >
              <MenuRoundedIcon />
            </IconButton>

            <Box
              component="img"
              src={tiumLogo}
              alt="TIUM"
              sx={{ height: 28, width: "auto", display: "block" }}
            />
          </>
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
            {getAvatarInitial(me?.full_name ?? "")}
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
          {me ? (
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography sx={{ fontWeight: 700 }}>{me.full_name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {me.department ?? "부서 미지정"} ·{" "}
                {me.role === "hr_admin" ? "인사 관리자" : "직원"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {me.email}
              </Typography>
            </Box>
          ) : (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ px: 2, py: 1.5 }}
            >
              사용자 정보를 불러오지 못했어요.
            </Typography>
          )}

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
