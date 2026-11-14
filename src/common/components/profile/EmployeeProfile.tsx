import { Avatar, Box, Stack, Typography } from "@mui/material";
import {
  getAvatarColor,
  getAvatarInitial,
} from "../../../utils/profile/avatar";

type EmployeeProfileProps = {
  name: string;
  subtitle?: string;
  /** 아바타 색상 시드 (기본: name) — 유저별 고정 랜덤 톤 */
  seed?: string;
  size?: "small" | "medium";
  nameColor?: string;
  noWrap?: boolean;
};

/** Navbar 계정 Avatar 스타일(원형·첫글자·700) + 이름/부제 */
const SIZE_SX = {
  small: { width: 40, height: 40, fontSize: 14 },
  medium: { width: 44, height: 44, fontSize: 15 },
} as const;

const EmployeeProfile = ({
  name,
  subtitle,
  seed,
  size = "small",
  nameColor,
  noWrap = true,
}: EmployeeProfileProps) => {
  const avatar = getAvatarColor(seed ?? name);

  return (
    <Stack
      direction="row"
      spacing={1.25}
      sx={{ alignItems: "center", minWidth: 0 }}
    >
      <Avatar
        sx={{
          ...SIZE_SX[size],
          fontWeight: 700,
          bgcolor: avatar.bg,
          color: avatar.fg,
        }}
      >
        {getAvatarInitial(name)}
      </Avatar>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant={size === "small" ? "body2" : "body1"}
          sx={{ fontWeight: 700, color: nameColor }}
          noWrap={noWrap}
        >
          {name}
        </Typography>
        {subtitle ? (
          <Typography
            variant={size === "small" ? "subtitle1" : "body2"}
            color="text.secondary"
            noWrap={noWrap}
          >
            {subtitle}
          </Typography>
        ) : null}
      </Box>
    </Stack>
  );
};

export default EmployeeProfile;
