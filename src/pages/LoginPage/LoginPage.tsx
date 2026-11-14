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
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router";
import { signIn } from "../../apis/auth";
import { getMe } from "../../apis/me";
import tiumLogo from "../../assets/logo/tium-logo-dark-text.svg";
import { queryKeys } from "../../hooks/apis/queryKeys";

const LoginPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) {
      setError("이메일과 비밀번호를 모두 입력해 주세요.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await signIn(email, password);
      // 역할에 맞는 첫 화면으로 이동
      const me = await getMe();
      // 라우트 가드가 같은 정보를 다시 조회하지 않도록 캐시에 넣어두기
      queryClient.setQueryData(queryKeys.me, me);
      navigate(me.role === "hr_admin" ? "/admin" : "/dashboard", {
        replace: true,
      });
    } catch {
      setError("이메일 또는 비밀번호가 맞지 않아요.");
    } finally {
      setSubmitting(false);
    }
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
            {/* 랜딩페이지로 돌아가기 */}
            <Button
              component={Link}
              to="/"
              variant="text"
              size="small"
              startIcon={<ArrowBackRoundedIcon />}
              sx={{
                alignSelf: "flex-start",
                ml: -1,
                color: "text.secondary",
                fontWeight: 600,
              }}
            >
              처음 화면으로
            </Button>

            {/* 로고 */}
            <Box
              component="img"
              src={tiumLogo}
              alt="TIUM"
              sx={{ height: 36, width: "auto", alignSelf: "flex-start" }}
            />

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

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={submitting}
            >
              {submitting ? "로그인 중" : "로그인"}
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
