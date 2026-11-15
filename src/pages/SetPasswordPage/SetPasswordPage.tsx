import { useState } from "react";
import type { FormEvent } from "react";
import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { updatePassword } from "../../apis/auth";
import tiumLogo from "../../assets/logo/tium-logo-dark-text.svg";
import { toast } from "../../common/components/toast";
import {
  PASSWORD_MIN_LENGTH,
  SET_PASSWORD_DESCRIPTION,
  SET_PASSWORD_ERROR,
  SET_PASSWORD_HELPER,
  SET_PASSWORD_SUCCESS,
} from "../../configs/auth/setPassword";
import { useMe } from "../../hooks/apis/useMe";
import { useAuthStore } from "../../stores/authStore";

/** 초대받은 직원이 메일 링크로 들어와 첫 비밀번호를 정하는 화면 */
const SetPasswordPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: me } = useMe();
  const signOut = useAuthStore((state) => state.signOut);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!password || !confirm) {
      setError(SET_PASSWORD_ERROR.empty);
      return;
    }
    if (password.length < PASSWORD_MIN_LENGTH) {
      setError(SET_PASSWORD_ERROR.tooShort);
      return;
    }
    if (password !== confirm) {
      setError(SET_PASSWORD_ERROR.mismatch);
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await updatePassword(password);
      //로그아웃하고 새 비밀번호로 직접 로그인하도록 이동
      const email = me?.email;
      await signOut();
      queryClient.clear();
      toast.success(SET_PASSWORD_SUCCESS);
      navigate("/login", { replace: true, state: { email } });
    } catch {
      setError(SET_PASSWORD_ERROR.failed);
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
            <Box
              component="img"
              src={tiumLogo}
              alt="TIUM"
              sx={{ height: 36, width: "auto", alignSelf: "flex-start" }}
            />

            <Box>
              <Typography variant="h1" component="h1" sx={{ fontSize: 26 }}>
                {me ? `${me.full_name}님, 환영해요` : "환영해요"}
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                {SET_PASSWORD_DESCRIPTION}
              </Typography>
            </Box>

            {/* 인사 담당자가 등록한 정보 (확인용) */}
            {me && (
              <Box
                sx={{
                  px: 2,
                  py: 1.5,
                  borderRadius: "12px",
                  bgcolor: "background.default",
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  {me.department ?? "부서 미지정"}
                </Typography>
                <Typography sx={{ fontWeight: 700 }}>{me.email}</Typography>
              </Box>
            )}

            {error && (
              <Alert severity="error" sx={{ borderRadius: "12px" }}>
                {error}
              </Alert>
            )}

            <TextField
              label="새 비밀번호"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              helperText={SET_PASSWORD_HELPER}
              fullWidth
            />
            <TextField
              label="비밀번호 확인"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              fullWidth
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={submitting}
            >
              {submitting ? "설정 중" : "비밀번호 설정하기"}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
};

export default SetPasswordPage;
