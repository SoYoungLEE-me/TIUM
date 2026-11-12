import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import { Button, Paper, Stack, Typography } from "@mui/material";
import {
  SETTINGS_DIRTY_STATUS,
  SETTINGS_SAVED_STATUS,
} from "../../../configs/admin/setting";

type SettingsActionBarProps = {
  dirty: boolean;
  onCancel: () => void;
  onSave: () => void;
};

const SettingsActionBar = ({
  dirty,
  onCancel,
  onSave,
}: SettingsActionBarProps) => {
  return (
    <Paper
      variant="outlined"
      sx={{
        mt: { xs: 0, md: "auto" },
        px: 2.5,
        py: 1.5,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        flexWrap: "wrap",
        bgcolor: "background.paper",
        // 모바일: floating / 데스크톱: 페이지 하단 정적 배치
        position: { xs: "fixed", md: "static" },
        left: { xs: 16, md: "auto" },
        right: { xs: 16, md: "auto" },
        bottom: { xs: 16, md: "auto" },
        zIndex: { xs: 12, md: "auto" },
        boxShadow: {
          xs: "0 10px 28px rgba(33, 27, 34, 0.14)",
          md: "none",
        },
      }}
    >
      <Typography
        variant="body2"
        sx={{
          color: dirty ? "warning.main" : "primary.light",
          fontWeight: 600,
        }}
      >
        {dirty ? SETTINGS_DIRTY_STATUS : SETTINGS_SAVED_STATUS}
      </Typography>

      <Stack direction="row" spacing={1.25}>
        <Button
          variant="outlined"
          color="inherit"
          disabled={!dirty}
          onClick={onCancel}
          sx={{
            borderColor: "divider",
            color: "text.primary",
            bgcolor: "background.paper",
          }}
        >
          변경 취소
        </Button>
        <Button
          variant="contained"
          color="primary"
          disabled={!dirty}
          startIcon={<SaveRoundedIcon />}
          onClick={onSave}
        >
          변경사항 저장
        </Button>
      </Stack>
    </Paper>
  );
};

export default SettingsActionBar;
