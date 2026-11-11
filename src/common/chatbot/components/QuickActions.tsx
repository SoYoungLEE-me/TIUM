import { Box, Button } from "@mui/material";
import type { QuickAction } from "../types";

type QuickActionsProps = {
  actions: QuickAction[];
  onSelect: (trigger: string) => void;
};

const QuickActions = ({ actions, onSelect }: QuickActionsProps) => {
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, pl: 4.5 }}>
      {actions.map((action) => (
        <Button
          key={action.trigger}
          variant="outlined"
          size="small"
          onClick={() => onSelect(action.trigger)}
          sx={{
            borderRadius: 999,
            borderColor: "primary.main",
            color: "primary.main",
            px: 1.5,
            py: 0.5,
            fontSize: 12,
            bgcolor: "background.paper",
            "&:hover": {
              borderColor: "primary.dark",
              bgcolor: "action.hover",
            },
          }}
        >
          {action.label}
        </Button>
      ))}
    </Box>
  );
};

export default QuickActions;
