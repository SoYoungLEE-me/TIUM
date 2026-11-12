import {
  Box,
  Button,
  ButtonBase,
  IconButton,
  Paper,
  Typography,
} from "@mui/material";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import {
  DAY_STATUS_STYLE,
  LEGEND_STATUSES,
  WEEKDAY_LABELS,
} from "../../../configs/employee/attendance";
import type { CalendarDay } from "../../../models/employee/attendance";
import { formatMonthLabel } from "../../../utils/employee/attendance";

type AttendanceCalendarProps = {
  monthKey: string;
  days: Array<CalendarDay | null>;
  selectedDate: string | null;
  isThisMonth: boolean;
  onSelectDate: (date: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onThisMonth: () => void;
};

/** 칸 아래 작은 글씨 (연차는 유형명) */
const getCellNote = (day: CalendarDay) => {
  if (day.leave && (day.status === "leave" || day.status === "leave_pending")) {
    return day.status === "leave"
      ? day.leave.leave_type_name
      : `${day.leave.leave_type_name} 검토 중`;
  }
  return DAY_STATUS_STYLE[day.status].label;
};

const AttendanceCalendar = ({
  monthKey,
  days,
  selectedDate,
  isThisMonth,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
  onThisMonth,
}: AttendanceCalendarProps) => (
  <Paper
    sx={{
      p: { xs: 2, md: 2.5 },
      display: "flex",
      flexDirection: "column",
      gap: 2,
      minWidth: 0,
    }}
  >
    {/* 월 이동 */}
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1.5,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <IconButton aria-label="이전 달" onClick={onPrevMonth}>
          <ChevronLeftRoundedIcon />
        </IconButton>
        <Typography
          variant="h2"
          component="h2"
          sx={{ minWidth: 112, textAlign: "center", fontSize: 17 }}
        >
          {formatMonthLabel(monthKey)}
        </Typography>
        <IconButton aria-label="다음 달" onClick={onNextMonth}>
          <ChevronRightRoundedIcon />
        </IconButton>
        {!isThisMonth && (
          <Button
            variant="contained"
            color="secondary"
            size="small"
            onClick={onThisMonth}
            sx={{ ml: 0.5 }}
          >
            오늘
          </Button>
        )}
      </Box>

      {/* 범례 */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
        {LEGEND_STATUSES.map((status) => {
          const style = DAY_STATUS_STYLE[status];
          return (
            <Box
              key={status}
              sx={{ display: "inline-flex", alignItems: "center", gap: 0.75 }}
            >
              <Box
                aria-hidden="true"
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "3px",
                  bgcolor: style.bg,
                  border: 1,
                  borderColor: style.border,
                }}
              />
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: 12 }}
              >
                {status === "leave_pending" ? "연차 검토 중" : style.label}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>

    {/* 캘린더 (모바일에서는 칸 글씨를 숨기고 색으로만 구분) */}
    <Box
      role="grid"
      aria-label={`${formatMonthLabel(monthKey)} 근태 캘린더`}
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
        gap: { xs: 0.5, sm: 1 },
      }}
    >
      {WEEKDAY_LABELS.map((label, index) => (
        <Typography
          key={label}
          role="columnheader"
          variant="body2"
          sx={{
            fontSize: 12,
            fontWeight: 700,
            pl: 0.5,
            color: index >= 5 ? "text.disabled" : "text.secondary",
          }}
        >
          {label}
        </Typography>
      ))}

      {days.map((day, index) => {
        if (!day) return <Box key={`empty-${index}`} aria-hidden="true" />;

        const style = DAY_STATUS_STYLE[day.status];
        const selected = day.date === selectedDate;
        const note = getCellNote(day);

        return (
          <ButtonBase
            key={day.date}
            role="gridcell"
            aria-selected={selected}
            aria-label={`${day.day}일${note ? ` ${note}` : ""}`}
            onClick={() => onSelectDate(day.date)}
            sx={{
              minWidth: 0,
              minHeight: { xs: 44, sm: 64, md: 72 },
              p: { xs: 0.5, sm: 0.75, md: 1 },
              borderRadius: { xs: "10px", sm: "12px" },
              bgcolor: style.bg,
              border: selected ? 2 : 1,
              borderColor: selected ? "primary.main" : style.border,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 0.5,
              textAlign: "left",
              transition: "border-color 120ms",
              "&:hover": {
                borderColor: selected ? "primary.main" : "primary.light",
              },
            }}
          >
            <Box
              component="span"
              sx={{
                fontSize: 12,
                fontWeight: 700,
                lineHeight: "20px",
                minWidth: 20,
                textAlign: "center",
                borderRadius: 999,
                ...(day.isToday
                  ? {
                      bgcolor: "primary.main",
                      color: "primary.contrastText",
                      px: 0.5,
                    }
                  : { color: "text.primary" }),
              }}
            >
              {day.day}
            </Box>
            {note && (
              <Box
                component="span"
                sx={{
                  display: { xs: "none", sm: "block" },
                  fontSize: 11,
                  fontWeight: 700,
                  color: style.fg,
                  width: "100%",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {note}
              </Box>
            )}
          </ButtonBase>
        );
      })}
    </Box>
  </Paper>
);

export default AttendanceCalendar;
