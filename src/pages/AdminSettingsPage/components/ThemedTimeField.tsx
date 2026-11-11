import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import { useRef, useState } from "react";
import {
  Box,
  InputAdornment,
  Popover,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  TIME_HOUR_12_OPTIONS,
  TIME_MINUTE_OPTIONS,
  TIME_PERIOD_OPTIONS,
} from "../../../configs/admin/setting";
import type { DayPeriod } from "../../../utils/admin/setting";
import {
  buildTimeValueFrom12h,
  formatTimeLabel12h,
  parseTimeTo12h,
} from "../../../utils/admin/setting";

type ThemedTimeFieldProps = {
  label: string;
  value: string;
  onChange: (nextTime: string) => void;
};

const TimeColumn = ({
  title,
  options,
  selected,
  onSelect,
}: {
  title: string;
  options: Array<{ value: string; label: string }>;
  selected: string;
  onSelect: (value: string) => void;
}) => (
  <Box sx={{ minWidth: 84 }}>
    <Typography
      variant="subtitle1"
      sx={{ px: 1, pb: 0.75, fontWeight: 700, color: "text.secondary" }}
    >
      {title}
    </Typography>
    <Box
      sx={{
        maxHeight: 220,
        overflowY: "auto",
        pr: 0.5,
        "&::-webkit-scrollbar": { width: 6 },
        "&::-webkit-scrollbar-thumb": {
          bgcolor: "divider",
          borderRadius: 999,
        },
      }}
    >
      <Stack spacing={0.5}>
        {options.map((option) => {
          const active = option.value === selected;
          return (
            <Box
              key={option.value}
              component="button"
              type="button"
              onClick={() => onSelect(option.value)}
              sx={{
                border: 0,
                cursor: "pointer",
                textAlign: "center",
                py: 0.85,
                px: 1,
                borderRadius: 2,
                fontSize: 14,
                fontWeight: active ? 700 : 500,
                bgcolor: active ? "primary.main" : "transparent",
                color: active ? "primary.contrastText" : "text.primary",
                "&:hover": {
                  bgcolor: active ? "primary.dark" : "action.hover",
                },
              }}
            >
              {option.label}
            </Box>
          );
        })}
      </Stack>
    </Box>
  </Box>
);

const ColumnDivider = () => (
  <Box sx={{ width: 1, bgcolor: "divider", alignSelf: "stretch" }} />
);

const ThemedTimeField = ({ label, value, onChange }: ThemedTimeFieldProps) => {
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const { period, hour12, minute } = parseTimeTo12h(value);

  const nearestMinute =
    TIME_MINUTE_OPTIONS.find((option) => option === minute) ??
    TIME_MINUTE_OPTIONS[0];

  const commit = (
    nextPeriod: DayPeriod,
    nextHour12: string,
    nextMinute: string
  ) => {
    onChange(buildTimeValueFrom12h(nextPeriod, nextHour12, nextMinute));
  };

  return (
    <Box ref={anchorRef} sx={{ width: "100%" }}>
      <TextField
        label={label}
        value={formatTimeLabel12h(value)}
        fullWidth
        onClick={() => setOpen(true)}
        slotProps={{
          input: {
            readOnly: true,
            endAdornment: (
              <InputAdornment position="end">
                <AccessTimeRoundedIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          },
          inputLabel: { shrink: true },
        }}
        sx={{
          "& .MuiOutlinedInput-root": { cursor: "pointer" },
          "& .MuiInputBase-input": { cursor: "pointer" },
        }}
      />

      <Popover
        open={open}
        anchorEl={anchorRef.current}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              p: 1.5,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              boxShadow: "0 12px 32px rgba(33, 27, 34, 0.12)",
              bgcolor: "background.paper",
            },
          },
        }}
      >
        <Stack direction="row" spacing={1.25}>
          <TimeColumn
            title="오전/오후"
            options={TIME_PERIOD_OPTIONS.map((option) => ({
              value: option.value,
              label: option.label,
            }))}
            selected={period}
            onSelect={(nextPeriod) => {
              commit(nextPeriod as DayPeriod, hour12, nearestMinute);
            }}
          />
          <ColumnDivider />
          <TimeColumn
            title="시"
            options={TIME_HOUR_12_OPTIONS.map((option) => ({
              value: option,
              label: option,
            }))}
            selected={hour12}
            onSelect={(nextHour) => {
              commit(period, nextHour, nearestMinute);
            }}
          />
          <ColumnDivider />
          <TimeColumn
            title="분"
            options={TIME_MINUTE_OPTIONS.map((option) => ({
              value: option,
              label: option,
            }))}
            selected={nearestMinute}
            onSelect={(nextMinute) => {
              commit(period, hour12, nextMinute);
            }}
          />
        </Stack>
      </Popover>
    </Box>
  );
};

export default ThemedTimeField;
