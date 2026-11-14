import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import { formatTime } from "../../../utils/employee/dashboard";

type AttendanceCardProps = {
  checkIn: string | null;
  checkOut: string | null;
  isLate: boolean;
  /* "기본 근무 09:00 – 18:00" */
  workHoursLabel: string;
  /* 출퇴근 요청 중이면 버튼 잠금 */
  processing?: boolean;
  onCheckIn: () => void;
  onCheckOut: () => void;
};

const AttendanceCard = ({
  checkIn,
  checkOut,
  isLate,
  workHoursLabel,
  processing = false,
  onCheckIn,
  onCheckOut,
}: AttendanceCardProps) => {
  const timeBoxes = [
    {
      label: "출근",
      value: formatTime(checkIn),
      caption: checkIn ? (isLate ? "지각" : "정상 출근") : "기록 전",
      active: Boolean(checkIn),
    },
    {
      label: "퇴근",
      value: formatTime(checkOut),
      caption: checkOut ? "퇴근 완료" : "기록 전",
      active: Boolean(checkOut),
    },
  ];

  return (
    <Paper sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Typography variant="h2" component="h2">
          오늘 출퇴근
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {workHoursLabel}
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 1.5,
        }}
      >
        {timeBoxes.map((box) => (
          <Box
            key={box.label}
            sx={(theme) => ({
              p: 2,
              borderRadius: "14px",
              bgcolor: box.active
                ? theme.palette.leave.approved.bg
                : "background.default",
              display: "flex",
              flexDirection: "column",
              gap: 0.75,
            })}
          >
            <Typography
              variant="body2"
              sx={(theme) => ({
                fontWeight: 700,
                color: box.active
                  ? theme.palette.leave.approved.fg
                  : "text.secondary",
              })}
            >
              {box.label}
            </Typography>
            <Typography
              variant="h3"
              component="p"
              sx={{
                lineHeight: 1,
                color: box.active ? "text.primary" : "text.secondary",
              }}
            >
              {box.value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {box.caption}
            </Typography>
          </Box>
        ))}
      </Box>

      <Stack direction="row" spacing={1.25}>
        <Button
          variant="contained"
          color={checkIn ? "secondary" : "primary"}
          size="large"
          fullWidth
          disabled={processing || Boolean(checkIn)}
          onClick={onCheckIn}
        >
          {checkIn ? "출근 완료" : "출근하기"}
        </Button>
        <Button
          variant="contained"
          color={checkOut ? "secondary" : "primary"}
          size="large"
          fullWidth
          disabled={processing || !checkIn || Boolean(checkOut)}
          onClick={onCheckOut}
        >
          {checkOut ? "퇴근 완료" : "퇴근하기"}
        </Button>
      </Stack>
    </Paper>
  );
};

export default AttendanceCard;
