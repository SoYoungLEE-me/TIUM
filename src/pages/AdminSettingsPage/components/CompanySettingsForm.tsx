import {
  FormControlLabel,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import type { CompanySettings } from "../../../models/admin/setting";
import ThemedTimeField from "./ThemedTimeField";
import WorkdaysSelector from "./WorkdaysSelector";

type CompanySettingsFormProps = {
  draft: CompanySettings;
  onChange: (update: Partial<CompanySettings>) => void;
};

const CompanySettingsForm = ({
  draft,
  onChange,
}: CompanySettingsFormProps) => {
  return (
    <Paper variant="outlined" sx={{ p: 2.5 }}>
      <Stack
        direction="row"
        spacing={2}
        sx={{
          mb: 2,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="h2">기본 근무시간</Typography>
        <FormControlLabel
          sx={{
            mr: 0,
            gap: 1.25,
            "& .MuiFormControlLabel-label": {
              fontWeight: 600,
            },
          }}
          control={
            <Switch
              checked={draft.auto_approval_enabled}
              onChange={(e) =>
                onChange({ auto_approval_enabled: e.target.checked })
              }
            />
          }
          label="자동 승인 활성화"
        />
      </Stack>

      <Stack spacing={2.5}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <ThemedTimeField
            label="출근 시각"
            value={draft.work_start_time}
            onChange={(work_start_time) => onChange({ work_start_time })}
          />
          <ThemedTimeField
            label="퇴근 시각"
            value={draft.work_end_time}
            onChange={(work_end_time) => onChange({ work_end_time })}
          />
        </Stack>

        <TextField
          label="지각 기준(분)"
          type="number"
          value={draft.late_threshold}
          onChange={(e) =>
            onChange({
              late_threshold: Math.max(0, Number(e.target.value) || 0),
            })
          }
          slotProps={{ htmlInput: { min: 0 } }}
          fullWidth
        />

        <WorkdaysSelector
          value={draft.workdays}
          onChange={(workdays) => onChange({ workdays })}
        />
      </Stack>
    </Paper>
  );
};

export default CompanySettingsForm;
