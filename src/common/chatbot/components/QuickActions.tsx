import { Box, Button } from "@mui/material";
import type { QuickAction } from "../../../models/chatbot/chatbot";

type QuickActionsProps = {
  actions: QuickAction[];
  onSelect: (trigger: string) => void;
  /** false면 왼쪽 정렬(아바타 들여쓰기 없음). 메시지 하위 follow-up용 */
  inset?: boolean;
};

const QuickActions = ({
  actions,
  onSelect,
  inset = true,
}: QuickActionsProps) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 1,
        pl: inset ? 4.5 : 0,
        alignSelf: "flex-start",
        justifyContent: "flex-start",
      }}
    >
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
