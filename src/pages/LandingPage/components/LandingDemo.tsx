import { Box, Stack, Typography, keyframes } from "@mui/material";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import chatbotIcon from "../../../assets/chatbot-icon.png";
import { LANDING_DEMO } from "../../../configs/landing/landing";

const fill = keyframes`from { clip-path: inset(100% 0 0 0); } to { clip-path: inset(0 0 0 0); }`;
const appear = keyframes`from { opacity: 0; } to { opacity: 1; }`;

const LandingDemo = () => {
  const { request, days, result, resultDetail } = LANDING_DEMO;

  return (
    <Box aria-label="연차 신청 예시" role="img" sx={{ mt: { xs: 5, md: 8 } }}>
      {/* 요청 입력창 */}
      <Stack
        direction="row"
        spacing={1.5}
        sx={{
          alignItems: "center",
          maxWidth: 520,
          ml: "auto",
          mb: 2,
          pl: 1,
          pr: 0.75,
          py: 0.75,
          borderRadius: 999,
          bgcolor: "background.paper",
          border: 1,
          borderColor: "divider",
        }}
      >
        <Box
          component="img"
          src={chatbotIcon}
          alt=""
          sx={{ width: 36, height: 36, flexShrink: 0 }}
        />
        <Typography
          sx={{ flex: 1, fontSize: { xs: 14, md: 16 }, fontWeight: 600 }}
        >
          {request}
        </Typography>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "primary.main",
            color: "primary.contrastText",
          }}
        >
          <ArrowUpwardRoundedIcon fontSize="small" />
        </Box>
      </Stack>

      {/* 그 주 캘린더 */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
          gap: { xs: 0.5, md: 1 },
        }}
      >
        {days.map((d) => (
          <Box
            key={d.date}
            sx={(theme) => ({
              position: "relative",
              overflow: "hidden",
              minHeight: { xs: 92, md: 168 },
              p: { xs: 1, md: 2 },
              borderRadius: { xs: "12px", md: "18px" },
              bgcolor: d.weekend
                ? theme.palette.leave.weekend.bg
                : "background.paper",
              border: d.weekend ? 0 : `1px solid ${theme.palette.divider}`,
              color: d.weekend
                ? theme.palette.leave.weekend.fg
                : "text.primary",
            })}
          >
            {/* 연차 칸 채우기 */}
            {d.leave && (
              <Box
                sx={(theme) => ({
                  position: "absolute",
                  inset: 0,
                  bgcolor: theme.palette.secondary.main,
                  animation: `${fill} 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) 0.6s both`,
                  "@media (prefers-reduced-motion: reduce)": {
                    animation: "none",
                  },
                })}
              />
            )}

            {/* 오후 반차는 칸의 아래 절반만 */}
            {d.half && (
              <Box
                sx={(theme) => ({
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: "50%",
                  bgcolor: theme.palette.leave.half.bg,
                })}
              />
            )}
            {d.half && (
              <Typography
                sx={(theme) => ({
                  display: { xs: "none", md: "block" },
                  position: "absolute",
                  left: 16,
                  bottom: 14,
                  fontSize: 13,
                  fontWeight: 700,
                  color: theme.palette.leave.half.fg,
                })}
              >
                {d.half}
              </Typography>
            )}

            <Box
              sx={{
                position: "relative",
                color: d.leave ? "secondary.contrastText" : "inherit",
              }}
            >
              <Typography
                sx={{
                  fontSize: { xs: 12, md: 14 },
                  fontWeight: 600,
                  color: "inherit",
                  opacity: 0.7,
                }}
              >
                {d.day}
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: 22, md: 40 },
                  fontWeight: 700,
                  lineHeight: 1.1,
                  letterSpacing: "-0.03em",
                  color: "inherit",
                }}
              >
                {d.date}
              </Typography>

              {d.leave && (
                <Box
                  sx={{
                    display: { xs: "none", md: "block" },
                    mt: 3,
                    animation: `${appear} 0.3s ease 1.2s both`,
                    "@media (prefers-reduced-motion: reduce)": {
                      animation: "none",
                    },
                  }}
                >
                  <Typography
                    sx={{ fontSize: 15, fontWeight: 700, color: "inherit" }}
                  >
                    {result}
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: "inherit" }}>
                    {resultDetail}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        ))}
      </Box>

      {/* 모바일에서는 결과를 아래에 */}
      <Typography
        sx={{
          display: { xs: "block", md: "none" },
          mt: 1.5,
          fontSize: 14,
          fontWeight: 700,
          color: "secondary.dark",
        }}
      >
        20일 {result}, {resultDetail}
      </Typography>
    </Box>
  );
};

export default LandingDemo;
