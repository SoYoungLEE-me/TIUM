import { Box, Button } from "@mui/material";
import type { ClarificationOption } from "../../../models/chatbot/chatbot";
import { formatLeaveOptionLabel } from "../../../utils/chatbot/chatbot";

type ClarificationOptionsProps = {
  options: ClarificationOption[];
  onSelect: (label: string) => void;
  disabled?: boolean;
};

const ClarificationOptions = ({
  options,
  onSelect,
  disabled = false,
}: ClarificationOptionsProps) => {
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
      {options.map((option) => {
        const display = formatLeaveOptionLabel(option.label);
        return (
          <Button
            key={option.value}
            variant="outlined"
            size="small"
            disabled={disabled}
            onClick={() => onSelect(display)}
            sx={{
              borderRadius: 999,
              borderColor: "primary.main",
              color: "primary.main",
              px: 1.5,
              fontSize: 12,
              bgcolor: "background.paper",
            }}
          >
            {display}
          </Button>
        );
      })}
    </Box>
  );
};

export default ClarificationOptions;
