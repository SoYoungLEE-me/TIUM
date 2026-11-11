import { useState } from "react";
import type { FormEvent } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) {
      setError("이메일과 비밀번호를 모두 입력해 주세요.");
      return;
    }

    setError(null);
    // TODO: Supabase 로그인 연결. 지금은 UI 확인용으로 바로 이동
    navigate("/dashboard");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        p: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Paper
        sx={{
          width: "100%",
          maxWidth: 420,
          p: { xs: 3, md: 5 },
          borderRadius: "24px",
        }}
      >
        <Box component="form" noValidate onSubmit={handleSubmit}>
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="h1" component="h1" sx={{ fontSize: 26 }}>
                로그인
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                이메일로 로그인해 주세요.
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ borderRadius: "12px" }}>
                {error}
              </Alert>
            )}

            <TextField
              label="이메일"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
            />
            <TextField
              label="비밀번호"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
            />

            <FormControlLabel
              control={<Checkbox size="small" />}
              label={
                <Typography variant="body2" color="text.secondary">
                  로그인 상태 유지
                </Typography>
              }
            />

            <Button type="submit" variant="contained" size="large" fullWidth>
              로그인
            </Button>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "center" }}
            >
              계정이 없다면 인사팀에 초대를 요청해 주세요.
            </Typography>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginPage;
