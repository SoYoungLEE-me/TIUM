import { Box, Chip, Paper, Typography } from "@mui/material";
import { DAY_STATUS_STYLE } from "../../../configs/employee/attendance";
import type { CalendarDay } from "../../../models/employee/attendance";
import {
  formatDayLabel,
  formatMinutes,
  formatWorkDuration,
  getLateMinutes,
} from "../../../utils/employee/attendance";
import {
  formatLeavePeriod,
  formatTime,
} from "../../../utils/employee/dashboard";

type AttendanceDayDetailProps = {
  day: CalendarDay | null;
  workStartTime: string;
};

const DetailRow = ({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "space-between",
      gap: 2,
      py: 1.5,
      borderBottom: 1,
      borderColor: "divider",
      "&:last-of-type": { borderBottom: 0 },
    }}
  >
    <Typography color="text.secondary">{label}</Typography>
    <Typography
      sx={{
        fontWeight: 700,
        color: highlight ? "warning.main" : "text.primary",
      }}
    >
      {value}
    </Typography>
  </Box>
);

const getEmptyMessage = (day: CalendarDay) => {
  if (day.status === "weekend") return "주말이에요.";
  return "출퇴근 기록이 없어요.";
};

const AttendanceDayDetail = ({
  day,
  workStartTime,
}: AttendanceDayDetailProps) => {
  if (!day) {
    return (
      <Paper
        sx={{
          p: 3,
          minHeight: 200,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography color="text.secondary">
          캘린더에서 날짜를 선택해 주세요.
        </Typography>
      </Paper>
    );
  }

  const style = DAY_STATUS_STYLE[day.status];
  const { record, leave } = day;
  const lateMinutes =
    record?.status === "late"
      ? getLateMinutes(record.check_in, workStartTime)
      : 0;
  const isWorking = Boolean(
    record?.check_in && !record.check_out && day.isToday
  );

  return (
    <Paper sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Typography variant="h2" component="h2" sx={{ fontSize: 17 }}>
          {formatDayLabel(day.date)}
        </Typography>
        {style.label && (
          <Chip
            size="small"
            label={style.label}
            sx={{ bgcolor: style.bg, color: style.fg, fontWeight: 600 }}
          />
        )}
      </Box>

      {leave ? (
        <Box>
          <DetailRow label="유형" value={leave.leave_type_name} />
          <DetailRow
            label="기간"
            value={formatLeavePeriod(leave.start_date, leave.end_date)}
          />
          <DetailRow label="차감" value={`${leave.total_days}일`} />
          <DetailRow
            label="상태"
            value={leave.status === "approved" ? "승인 완료" : "관리자 검토 중"}
          />
        </Box>
      ) : record ? (
        <Box>
          <DetailRow label="출근" value={formatTime(record.check_in)} />
          <DetailRow
            label="퇴근"
            value={isWorking ? "근무 중" : formatTime(record.check_out)}
          />
          <DetailRow
            label="근무 시간"
            value={
              isWorking
                ? "-"
                : formatWorkDuration(record.check_in, record.check_out)
            }
          />
          {lateMinutes > 0 && (
            <DetailRow
              label="지각"
              value={formatMinutes(lateMinutes)}
              highlight
            />
          )}
        </Box>
      ) : (
        <Typography color="text.secondary" sx={{ py: 3, textAlign: "center" }}>
          {getEmptyMessage(day)}
        </Typography>
      )}

      <Box
        sx={{ bgcolor: "background.default", borderRadius: "14px", p: 1.75 }}
      >
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ lineHeight: 1.6 }}
        >
          기본 출근 시각 {workStartTime.slice(0, 5)} 기준으로 지각을 판정해요.
        </Typography>
      </Box>
    </Paper>
  );
};

export default AttendanceDayDetail;
