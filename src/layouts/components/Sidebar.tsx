import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { Link, useLocation } from "react-router";
import type { MenuItem } from "./menus";

const MenuBadge = ({ count }: { count: number }) => (
  <Box
    component="span"
    sx={{
      ml: "auto",
      minWidth: 22,
      height: 22,
      px: 0.75,
      borderRadius: 999,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      bgcolor: "#C2513F",
      color: "#FFFFFF",
      fontSize: 11,
      fontWeight: 700,
      lineHeight: 1,
    }}
  >
    {count > 99 ? "99+" : count}
  </Box>
);

const DRAWER_WIDTH = 240;

interface SidebarProps {
  menuItems: MenuItem[];
  /* md 이상: permanent(고정), 미만: temporary(햄버거로 열림) */
  variant: "permanent" | "temporary";
  open: boolean;
  onClose: () => void;
}

const Sidebar = ({ menuItems, variant, open, onClose }: SidebarProps) => {
  const { pathname } = useLocation();
  const isPermanent = variant === "permanent";

  return (
    <Box
      component="aside"
      sx={{ width: { md: DRAWER_WIDTH + 16 }, flexShrink: { md: 0 } }}
    >
      <Drawer
        variant={variant}
        open={isPermanent ? true : open}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        slotProps={{
          paper: {
            sx: (theme) => ({
              width: DRAWER_WIDTH,
              boxSizing: "border-box",
              bgcolor: theme.palette.sidebar.bg,
              border: 0,
              ...(isPermanent
                ? { m: 2, height: "calc(100% - 32px)", borderRadius: "20px" }
                : { borderRadius: "0 20px 20px 0" }),
            }),
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            p: 2,
            gap: 3,
          }}
        >
          {/* 로고 */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              px: 1,
              pt: 0.5,
            }}
          >
            <Typography
              sx={{ color: "#FFFFFF", fontWeight: 700, fontSize: 16 }}
            >
              TIUM
            </Typography>
          </Box>

          {/* 메뉴 */}
          <List
            component="nav"
            aria-label="주 메뉴"
            sx={{ display: "flex", flexDirection: "column", gap: 0.5, p: 0 }}
          >
            {menuItems.map((item) => {
              // 메뉴 하이라이트가 "/admin"은 정확히 일치할 때만 활성화 (/admin/leaves에서 같이 켜지지 않도록)
              const selected =
                item.path === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.path);
              return (
                <ListItemButton
                  key={item.path}
                  component={Link}
                  to={item.path}
                  selected={selected}
                  onClick={isPermanent ? undefined : onClose}
                  sx={(theme) => ({
                    minHeight: 44,
                    color: selected ? "#FFFFFF" : theme.palette.sidebar.text,
                    "& .MuiListItemIcon-root": {
                      color: selected
                        ? theme.palette.secondary.main
                        : theme.palette.sidebar.text,
                      minWidth: 36,
                    },
                    "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
                  })}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    slotProps={{
                      primary: {
                        sx: { fontSize: 14, fontWeight: selected ? 700 : 500 },
                      },
                    }}
                  />
                  {item.badge != null && item.badge > 0 ? (
                    <MenuBadge count={item.badge} />
                  ) : null}
                </ListItemButton>
              );
            })}
          </List>
        </Box>
      </Drawer>
    </Box>
  );
};

export default Sidebar;
