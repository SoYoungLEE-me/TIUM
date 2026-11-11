import type { ReactNode } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { WORKDAY_OPTIONS } from "../../../configs/admin/setting";
import type { Workday } from "../../../models/admin/setting";

type WorkdaysSelectorProps = {
  value: Workday[];
  onChange: (workdays: Workday[]) => void;
  endAction?: ReactNode;
};

const WorkdaysSelector = ({
  value,
  onChange,
  endAction,
}: WorkdaysSelectorProps) => {
  const toggle = (day: Workday) => {
    if (value.includes(day)) {
      onChange(value.filter((item) => item !== day));
      return;
    }
    onChange([...value, day].sort((a, b) => a - b));
  };

  return (
    <Box>
      <Typography sx={{ fontWeight: 700, mb: 1.25 }}>근무 요일</Typography>
      <Stack
        direction="row"
        spacing={1}
        useFlexGap
        sx={{
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          rowGap: 1.25,
        }}
      >
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
          {WORKDAY_OPTIONS.map((option) => {
            const selected = value.includes(option.value);
            return (
              <Box
                key={option.value}
                component="button"
                type="button"
                onClick={() => toggle(option.value)}
                aria-pressed={selected}
                aria-label={`${option.label}요일`}
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  border: "1px solid",
                  borderColor: selected ? "primary.main" : "divider",
                  bgcolor: selected ? "primary.main" : "background.paper",
                  color: selected ? "primary.contrastText" : "text.secondary",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background-color 0.15s ease, color 0.15s ease",
                  "&:hover": {
                    bgcolor: selected ? "primary.dark" : "action.hover",
                  },
                }}
              >
                {option.label}
              </Box>
            );
          })}
        </Stack>
        {endAction}
      </Stack>
    </Box>
  );
};

export default WorkdaysSelector;
