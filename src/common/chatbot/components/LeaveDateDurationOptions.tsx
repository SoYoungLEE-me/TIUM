import { Box, Button, CircularProgress } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { getMyLeaveRequests } from "../../../apis/leaves";
import { supabase } from "../../../libs/supabaseClient";
import { seoulDatePlusDays } from "../../../utils/chatbot/chatbot";

const MAX_END_BUTTONS = 4;
const START_BUTTON_COUNT = 3;

type LeaveDateDurationOptionsProps = {
  /** start: 최소 신청 기한 이후 시작일 3개 / end: 시작일부터 연속 한도(최대 4) */
  mode?: "start" | "end";
  /** end 모드에서 기준이 되는 시작일 (YYYY-MM-DD) */
  startDate?: string | null;
  onSelect: (message: string) => void;
  disabled?: boolean;
};

const addDaysToIso = (iso: string, days: number): string => {
  const [y, m, d] = iso.split("-").map(Number);
  const utc = Date.UTC(y, m - 1, d + days);
  return new Date(utc).toISOString().slice(0, 10);
};

/** inclusive 날짜 목록 */
const eachDateInclusive = (start: string, end: string): string[] => {
  const out: string[] = [];
  let cur = start;
  while (cur <= end) {
    out.push(cur);
    cur = addDaysToIso(cur, 1);
    if (out.length > 400) break;
  }
  return out;
};

const LeaveDateDurationOptions = ({
  mode = "start",
  startDate,
  onSelect,
  disabled = false,
}: LeaveDateDurationOptionsProps) => {
  const rulesQuery = useQuery({
    queryKey: ["approvalRules", "leaveDateOptions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("approval_rules")
        .select("min_notice_days, max_consecutive_days")
        .eq("is_active", true);
      if (error) throw error;

      const noticeValues = (data ?? [])
        .map((r) => r.min_notice_days)
        .filter((n): n is number => typeof n === "number" && n >= 0);
      const consecutiveValues = (data ?? [])
        .map((r) => r.max_consecutive_days)
        .filter((n): n is number => typeof n === "number" && n > 0);

      return {
        minNoticeDays:
          noticeValues.length > 0 ? Math.max(...noticeValues) : 1,
        maxConsecutiveDays:
          consecutiveValues.length > 0
            ? Math.max(...consecutiveValues)
            : MAX_END_BUTTONS,
      };
    },
    staleTime: 60_000,
  });

  const approvedQuery = useQuery({
    queryKey: ["leaveRequests", "approvedDates"],
    queryFn: async () => {
      const rows = await getMyLeaveRequests({ page: 1, page_size: 100 });
      const blocked = new Set<string>();
      const horizon = seoulDatePlusDays(120);
      for (const row of rows) {
        if (row.status !== "approved") continue;
        for (const d of eachDateInclusive(row.start_date, row.end_date)) {
          if (d <= horizon) blocked.add(d);
        }
      }
      return blocked;
    },
    staleTime: 30_000,
  });

  if (rulesQuery.isLoading || approvedQuery.isLoading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 0.5 }}>
        <CircularProgress size={16} />
      </Box>
    );
  }

  const blocked = approvedQuery.data ?? new Set<string>();

  if (mode === "start") {
    // 당일 제외: 오늘 + min_notice 부터, 승인된 날은 건너뛰며 3개 수집
    const baseOffset = Math.max(1, rulesQuery.data?.minNoticeDays ?? 1);
    const dates: string[] = [];
    for (let i = 0; dates.length < START_BUTTON_COUNT && i < 60; i += 1) {
      const date = seoulDatePlusDays(baseOffset + i);
      if (blocked.has(date)) continue;
      dates.push(date);
    }

    return (
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        {dates.map((date) => (
          <Button
            key={date}
            variant="outlined"
            size="small"
            disabled={disabled}
            onClick={() => onSelect(`시작일 ${date}`)}
            sx={{
              borderRadius: 999,
              borderColor: "primary.main",
              color: "primary.main",
              px: 1.5,
              fontSize: 12,
              bgcolor: "background.paper",
            }}
          >
            {date}
          </Button>
        ))}
      </Box>
    );
  }

  const base =
    startDate ??
    seoulDatePlusDays(Math.max(1, rulesQuery.data?.minNoticeDays ?? 1));
  const maxSpan = Math.min(
    MAX_END_BUTTONS,
    Math.max(1, rulesQuery.data?.maxConsecutiveDays ?? MAX_END_BUTTONS),
  );

  // 시작일 ~ 시작일+(연속한도-1), 최대 4개. 구간에 승인일이 있으면 그 지점에서 중단
  const endDates: string[] = [];
  for (let offset = 0; offset < maxSpan; offset += 1) {
    const date = addDaysToIso(base, offset);
    const spanHasApproved = eachDateInclusive(base, date).some((d) =>
      blocked.has(d),
    );
    if (spanHasApproved) break;
    endDates.push(date);
  }

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
      {endDates.map((date) => {
        const offset =
          (Date.parse(`${date}T00:00:00Z`) - Date.parse(`${base}T00:00:00Z`)) /
          86_400_000;
        const message =
          offset === 0 ? `종료일 ${date} (하루만)` : `종료일 ${date}`;
        return (
          <Button
            key={date}
            variant="outlined"
            size="small"
            disabled={disabled}
            onClick={() => onSelect(message)}
            sx={{
              borderRadius: 999,
              borderColor: "primary.main",
              color: "primary.main",
              px: 1.5,
              fontSize: 12,
              bgcolor: "background.paper",
            }}
          >
            {date}
          </Button>
        );
      })}
    </Box>
  );
};

export default LeaveDateDurationOptions;
