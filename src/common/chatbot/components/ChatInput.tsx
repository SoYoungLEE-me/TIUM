import NorthIcon from "@mui/icons-material/North";
import { Box, IconButton, InputBase, Typography } from "@mui/material";
import { useState, type FormEvent, type KeyboardEvent } from "react";

type ChatInputProps = {
  placeholder: string;
  hint: string;
  disabled?: boolean;
  onSend: (message: string) => void;
};

const ChatInput = ({
  placeholder,
  hint,
  disabled = false,
  onSend,
}: ChatInputProps) => {
  const [value, setValue] = useState("");

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    submit();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <Box sx={{ px: 2, pb: 2, pt: 1 }}>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 999,
          pl: 2,
          pr: 0.75,
          py: 0.5,
        }}
      >
        <InputBase
          fullWidth
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          sx={{ fontSize: 14 }}
          inputProps={{ "aria-label": "챗봇 메시지 입력" }}
        />
        <IconButton
          type="submit"
          disabled={disabled || !value.trim()}
          aria-label="메시지 전송"
          sx={{
            bgcolor: "primary.main",
            color: "primary.contrastText",
            width: 36,
            height: 36,
            "&:hover": { bgcolor: "primary.dark" },
            "&.Mui-disabled": {
              bgcolor: "action.disabledBackground",
              color: "action.disabled",
            },
          }}
        >
          <NorthIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>
      <Typography
        variant="subtitle1"
        sx={{ mt: 1, textAlign: "center", display: "block" }}
      >
        {hint}
      </Typography>
    </Box>
  );
};

export default ChatInput;
