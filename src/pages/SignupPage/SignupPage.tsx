import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  Alert,
  Box,
  Button,
  Link,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router";

// TODO: 부서 목록이 테이블로 관리되면 DB에서 불러오기
const DEPARTMENTS = ["개발팀", "디자인팀", "영업팀", "인사팀"];

const initialForm = {
  full_name: "",
  email: "",
  department: "",
  password: "",
  passwordConfirm: "",
};

const SignupPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const passwordMismatch =
    form.passwordConfirm.length > 0 && form.password !== form.passwordConfirm;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !form.full_name ||
      !form.email ||
      !form.password ||
      !form.passwordConfirm
    ) {
      setError("필수 항목을 모두 입력해 주세요.");
      return;
    }
    if (form.password.length < 6) {
      setError("비밀번호는 6자 이상으로 입력해 주세요.");
      return;
    }
    if (passwordMismatch) {
      setError("비밀번호가 일치하지 않아요.");
      return;
    }

    setError(null);
    // TODO: Supabase 회원가입 연결. 지금은 UI 확인용으로 로그인 페이지로 이동
    navigate("/login");
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
                회원가입
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                회사 이메일로 계정을 만들어 주세요.
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ borderRadius: "12px" }}>
                {error}
              </Alert>
            )}

            <TextField
              label="이름"
              name="full_name"
              autoComplete="name"
              value={form.full_name}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              label="이메일"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              select
              label="부서"
              name="department"
              value={form.department}
              onChange={handleChange}
              fullWidth
            >
              {DEPARTMENTS.map((dept) => (
                <MenuItem key={dept} value={dept}>
                  {dept}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="비밀번호"
              name="password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              helperText="6자 이상"
              required
              fullWidth
            />
            <TextField
              label="비밀번호 확인"
              name="passwordConfirm"
              type="password"
              autoComplete="new-password"
              value={form.passwordConfirm}
              onChange={handleChange}
              error={passwordMismatch}
              helperText={
                passwordMismatch ? "비밀번호가 일치하지 않아요." : " "
              }
              required
              fullWidth
            />

            <Button type="submit" variant="contained" size="large" fullWidth>
              회원가입
            </Button>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "center" }}
            >
              이미 계정이 있나요?{" "}
              <Link component={RouterLink} to="/login" sx={{ fontWeight: 600 }}>
                로그인
              </Link>
            </Typography>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
};

export default SignupPage;
