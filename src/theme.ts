import { createTheme, alpha } from "@mui/material";

/**
 * Palette
 *  - Plum   #744577  → primary (브랜드, 주요 버튼, 선택 상태)
 *  - Cream  #F0E9B6  → warning 계열 (승인 대기, 반차)
 *  - Sage   #ACCFA3  → success 계열 (출근, 승인 완료)
 *  - Teal   #84C5B1  → secondary / info (연차 사용, AI 에이전트)
 */
const plum = {
  main: "#744577",
  light: "#9A6E9D",
  dark: "#4E2C50",
  soft: "#F1E8F1",
};
const cream = { main: "#F0E9B6", dark: "#6B5D10", soft: "#FAF6DD" };
const sage = { main: "#ACCFA3", dark: "#3F6E3A", soft: "#E7F1E3" };
const teal = { main: "#84C5B1", dark: "#2F7A65", soft: "#E2F2EC" };

// ---- 커스텀 팔레트 타입 확장 (연차 상태 칩, 사이드바 등) ----
declare module "@mui/material/styles" {
  interface Palette {
    leave: {
      approved: { bg: string; fg: string };
      pending: { bg: string; fg: string };
      rejected: { bg: string; fg: string };
      annual: { bg: string; fg: string };
      half: { bg: string; fg: string };
      weekend: { bg: string; fg: string };
    };
    sidebar: { bg: string; text: string; active: string };
  }
  interface PaletteOptions {
    leave?: Palette["leave"];
    sidebar?: Palette["sidebar"];
  }
}

const theme = createTheme({
  palette: {
    mode: "light", // 배경이 밝으므로 dark → light
    primary: {
      main: plum.main,
      light: plum.light,
      dark: plum.dark,
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: teal.main,
      dark: teal.dark,
      light: teal.soft,
      contrastText: "#1E3B33",
    },
    success: { main: sage.dark, light: sage.main, contrastText: "#FFFFFF" },
    warning: { main: cream.dark, light: cream.main, contrastText: "#FFFFFF" },
    info: { main: teal.dark, light: teal.main, contrastText: "#FFFFFF" },
    error: { main: "#C2513F", light: "#F6DCD6", contrastText: "#FFFFFF" },
    background: {
      default: "#F6F3EC", // 예시처럼 따뜻한 오프화이트
      paper: "#FFFFFF",
    },
    text: {
      primary: "#211B22",
      secondary: "#6E6670",
      disabled: "#B4ADB5",
    },
    divider: "#ECE7DE",
    action: {
      hover: alpha(plum.main, 0.06),
      selected: alpha(plum.main, 0.12),
      active: plum.main,
      focus: alpha(plum.main, 0.16),
    },
    leave: {
      approved: { bg: sage.soft, fg: sage.dark },
      pending: { bg: cream.soft, fg: cream.dark },
      rejected: { bg: "#F8E1DC", fg: "#A8402F" },
      annual: { bg: teal.soft, fg: teal.dark },
      half: { bg: cream.main, fg: "#5E531A" },
      weekend: { bg: "#F1EEE8", fg: "#9A9399" },
    },
    sidebar: {
      bg: "#231A24", // 플럼 톤을 섞은 딥 다크
      text: "#BFB5C0",
      active: alpha(plum.light, 0.28),
    },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: "Paperozi, Arial, sans-serif",
    h1: { fontWeight: 700, fontSize: "24px", letterSpacing: "-0.02em" },
    h2: { fontWeight: 700, fontSize: "1rem" },
    h3: { fontWeight: 700, fontSize: "28px" }, // KPI 숫자
    body1: { fontSize: "14px" },
    body2: { fontSize: "13px" },
    subtitle1: { fontSize: "0.6875rem", color: "#6E6670" },
    button: { fontWeight: 600 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: { body: { backgroundColor: "#F6F3EC" } },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: "30px",
          textTransform: "none",
          // MUI v7: containedSecondary / sizeLarge 대신 variants로 조건 지정
          variants: [
            {
              props: { variant: "contained", color: "secondary" },
              style: {
                backgroundColor: "#FFFFFF",
                color: "#211B22",
                border: "1px solid #ECE7DE",
                "&:hover": { backgroundColor: "#F3EFE8" },
              },
            },
            {
              props: { size: "large" },
              style: { padding: "8px 32px", fontWeight: 700, fontSize: "16px" },
            },
          ],
        },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { border: "1px solid #ECE7DE", borderRadius: 16 },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { borderRadius: 16, border: "1px solid #ECE7DE" },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontWeight: 600,
          fontSize: "12px",
          height: 24,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          "&.Mui-selected": {
            backgroundColor: alpha(plum.light, 0.28),
            "&:hover": { backgroundColor: alpha(plum.light, 0.36) },
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: "#FFFFFF",
          "& .MuiOutlinedInput-notchedOutline": { borderColor: "#ECE7DE" },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: plum.main,
          },
        },
      },
    },
  },
});

export default theme;

/* 사용 예:
 * <Chip label="승인" sx={(t) => ({ bgcolor: t.palette.leave.approved.bg, color: t.palette.leave.approved.fg })} />
 * <Drawer PaperProps={{ sx: (t) => ({ bgcolor: t.palette.sidebar.bg }) }} />
 */
