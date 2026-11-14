import {
  Box,
  Paper,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import type { LeaveType } from "../../../models/admin/setting";

type LeaveTypesListProps = {
  types: LeaveType[];
  onToggle: (typeId: string) => void;
};

const LeaveTypesList = ({ types, onToggle }: LeaveTypesListProps) => {
  return (
    <Paper variant="outlined" sx={{ p: 2.5 }}>
      <Typography variant="h2" sx={{ mb: 1 }}>
        휴가 유형
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 120px 72px",
          columnGap: 2,
          alignItems: "center",
          py: 1.25,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
          이름
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontWeight: 600, textAlign: "right" }}
        >
          차감 단위
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontWeight: 600, textAlign: "center" }}
        >
          활성
        </Typography>
      </Box>

      {types.map((type) => (
        <Box
          key={type.id}
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 120px 72px",
            columnGap: 2,
            alignItems: "center",
            py: 1.75,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography sx={{ fontWeight: 700 }}>{type.name}</Typography>
          <Stack
            direction="row"
            spacing={0.75}
            sx={{ alignItems: "center", justifyContent: "flex-end" }}
          >
            <Box
              sx={{
                minWidth: 52,
                px: 1.25,
                py: 0.75,
                borderRadius: 1.5,
                border: "1px solid",
                borderColor: "divider",
                textAlign: "center",
                typography: "body2",
                fontWeight: 600,
              }}
            >
              {type.deduction_days}
            </Box>
            <Typography variant="body2" color="text.secondary">
              일
            </Typography>
          </Stack>
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Switch
              checked={type.is_active}
              disabled={type.name === "연차"}
              onChange={() => onToggle(type.id)}
              slotProps={{
                input: { "aria-label": `${type.name} 활성` },
              }}
            />
          </Box>
        </Box>
      ))}
    </Paper>
  );
};

export default LeaveTypesList;
