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
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { signIn, updatePassword } from "../../apis/auth";
import tiumLogo from "../../assets/logo/tium-logo-dark-text.svg";
import { toast } from "../../common/components/toast";
import {
  CHANGE_PASSWORD_DESCRIPTION,
  CHANGE_PASSWORD_ERROR,
  CHANGE_PASSWORD_SUCCESS,
  PASSWORD_MIN_LENGTH,
  SET_PASSWORD_DESCRIPTION,
  SET_PASSWORD_ERROR,
  SET_PASSWORD_HELPER,
  SET_PASSWORD_SUCCESS,
} from "../../configs/auth/setPassword";
import { useMe } from "../../hooks/apis/useMe";
import { useAuthStore } from "../../stores/authStore";

interface SetPasswordPageProps {
  /* setup 초대받은 직원의 첫 비밀번호 설정, 원래 계정 메뉴에서는 비밀번호 변경 */
  mode?: "setup" | "change";
}

/** Supabase가 지금 쓰는 비밀번호와 같다고 거절했는지 확인 */
const isSamePasswordError = (error: unknown) =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  error.code === "same_password";

/** 초대받은 직원의 첫 비밀번호 설정과 로그인한 사용자의 비밀번호 변경 화면 */
const SetPasswordPage = ({ mode = "setup" }: SetPasswordPageProps) => {
  const isChange = mode === "change";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: me } = useMe();
  const signOut = useAuthStore((state) => state.signOut);
  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isChange && !current) {
      setError(CHANGE_PASSWORD_ERROR.emptyCurrent);
      return;
    }
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

    const email = me?.email;

    // 비밀번호 변경이면 현재 비밀번호가 맞는지 먼저 확인
    if (isChange) {
      try {
        await signIn(email ?? "", current);
      } catch {
        setError(CHANGE_PASSWORD_ERROR.wrongCurrent);
        setSubmitting(false);
        return;
      }
    }

    try {
      await updatePassword(password);
      // 로그아웃하고 새 비밀번호로 직접 로그인하도록 이동
      await signOut();
      queryClient.clear();
      toast.success(isChange ? CHANGE_PASSWORD_SUCCESS : SET_PASSWORD_SUCCESS);
      navigate("/login", { replace: true, state: { email } });
    } catch (err) {
      if (isSamePasswordError(err)) {
        setError(CHANGE_PASSWORD_ERROR.samePassword);
      } else {
        setError(
          isChange ? CHANGE_PASSWORD_ERROR.failed : SET_PASSWORD_ERROR.failed
        );
      }
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
            {/* 비밀번호 변경이면 이전 화면으로 돌아가기 */}
            {isChange && (
              <Button
                variant="text"
                size="small"
                startIcon={<ArrowBackRoundedIcon />}
                onClick={() => navigate(-1)}
                sx={{
                  alignSelf: "flex-start",
                  ml: -1,
                  color: "text.secondary",
                  fontWeight: 600,
                }}
              >
                돌아가기
              </Button>
            )}

            <Box
              component="img"
              src={tiumLogo}
              alt="TIUM"
              sx={{ height: 36, width: "auto", alignSelf: "flex-start" }}
            />

            <Box>
              <Typography variant="h1" component="h1" sx={{ fontSize: 26 }}>
                {isChange
                  ? "비밀번호 변경"
                  : me
                  ? `${me.full_name}님, 환영해요`
                  : "환영해요"}
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                {isChange
                  ? CHANGE_PASSWORD_DESCRIPTION
                  : SET_PASSWORD_DESCRIPTION}
              </Typography>
            </Box>

            {/* 로그인한 계정 정보 (확인용) */}
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

            {isChange && (
              <TextField
                label="현재 비밀번호"
                type="password"
                autoComplete="current-password"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                fullWidth
              />
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
              label="새 비밀번호 확인"
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
              {submitting
                ? "저장 중"
                : isChange
                ? "비밀번호 변경하기"
                : "비밀번호 설정하기"}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
};

export default SetPasswordPage;
