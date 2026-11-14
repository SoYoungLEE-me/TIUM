import type { ReactNode } from "react";
import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Typography,
  alpha,
} from "@mui/material";
import PaginationBar from "../../../common/components/pagenation";
import EmployeeProfile from "../../../common/components/profile/EmployeeProfile";
import { LEAVES_TABLE_UNIT_NOTE } from "../../../configs/admin/leaves";
import type { EmployeeLeaveRow } from "../../../models/admin/leaves";
import { formatLeaveDays } from "../../../utils/admin/leaves";
import LeaveUsageGauge from "./LeaveUsageGauge";

type EmployeeLeaveTableProps = {
  rows: EmployeeLeaveRow[];
  totalCount: number;
  year: number;
  page: number;
  pageCount: number;
  selectedEmployeeId?: string | null;
  toolbar?: ReactNode;
  onPageChange: (page: number) => void;
  onDetail: (employeeId: string) => void;
  onGrant: (employeeId: string) => void;
};

/**
 * 콘텐츠 열 합(240+80+64*3+80+100+148) + gap(12*8) + px(40) ≈ 976
 * width 100% → 끝 1fr이 여백. 컨테이너 < minWidth 이면 가로 스크롤.
 */
const ROW_MIN_WIDTH = 980;

const ROW_GRID = {
  display: "grid",
  // 콘텐츠 열 고정 + 마지막 1fr(공백). 줄어들면 1fr만 줄고, 그 다음 스크롤
  gridTemplateColumns:
    "240px 80px 64px 64px 64px 80px 100px 148px minmax(0, 1fr)",
  columnGap: 1.5,
  alignItems: "center",
  width: "100%",
  boxSizing: "border-box" as const,
};

const GridSpacer = () => <Box aria-hidden sx={{ minWidth: 0 }} />;

const EmployeeLeaveTable = ({
  rows,
  totalCount,
  year,
  page,
  pageCount,
  selectedEmployeeId = null,
  toolbar,
  onPageChange,
  onDetail,
  onGrant,
}: EmployeeLeaveTableProps) => {
  return (
    <Paper variant="outlined" sx={{ overflow: "hidden", height: "100%" }}>
      <Stack
        direction="row"
        spacing={1}
        sx={{
          px: 2.5,
          pt: 2.25,
          pb: 1.5,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="h2">
          직원별 연차 현황{" "}
          <Box component="span" sx={{ color: "primary.main" }}>
            {totalCount}명
          </Box>
        </Typography>
        <Chip
          size="small"
          label={`${year}년`}
          sx={{
            bgcolor: "#F1E8F1",
            color: "primary.main",
            fontWeight: 700,
          }}
        />
      </Stack>

      {toolbar ? <Box sx={{ px: 2.5, pb: 1.5 }}>{toolbar}</Box> : null}

      {rows.length === 0 ? (
        <Box sx={{ px: 2.5, pb: 3 }}>
          <Typography color="text.secondary">
            표시할 직원이 없습니다.
          </Typography>
        </Box>
      ) : (
        <>
          <Box
            sx={(theme) => ({
              overflowX: "auto",
              overflowY: "hidden",
              borderTop: "1px solid",
              borderColor: "divider",
              minWidth: 0,
              scrollbarWidth: "thin",
              scrollbarColor: `${alpha(theme.palette.primary.main, 0.45)} transparent`,
              "&::-webkit-scrollbar": {
                height: 6,
              },
              "&::-webkit-scrollbar-track": {
                backgroundColor: "transparent",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: alpha(theme.palette.primary.main, 0.45),
                borderRadius: 999,
                border: "2px solid transparent",
                backgroundClip: "content-box",
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.65),
                },
              },
            })}
          >
            <Box
              sx={{
                width: "100%",
                minWidth: ROW_MIN_WIDTH,
              }}
            >
              <Box
                sx={{
                  ...ROW_GRID,
                  px: 2.5,
                  py: 1.25,
                  bgcolor: "#F1E8F1",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontWeight: 700 }}
                >
                  직원 / 이메일
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontWeight: 700 }}
                >
                  부서
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontWeight: 700, textAlign: "right" }}
                >
                  부여
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontWeight: 700, textAlign: "right" }}
                >
                  사용
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontWeight: 700, textAlign: "right" }}
                >
                  잔여
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontWeight: 700, textAlign: "right" }}
                >
                  검토 대기
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontWeight: 700 }}
                >
                  신청 가능
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontWeight: 700, textAlign: "center" }}
                >
                  관리
                </Typography>
                <GridSpacer />
              </Box>

              {rows.map((row) => {
                const selected = row.employee.id === selectedEmployeeId;

                return (
                  <Box
                    role="button"
                    tabIndex={0}
                    key={row.employee.id}
                    onClick={() => onDetail(row.employee.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onDetail(row.employee.id);
                      }
                    }}
                    sx={{
                      ...ROW_GRID,
                      px: 2.5,
                      py: 1.75,
                      textAlign: "left",
                      borderRadius: 0,
                      borderBottom: "1px solid",
                      borderColor: "divider",
                      borderLeft: "3px solid",
                      borderLeftColor: selected
                        ? "primary.main"
                        : "transparent",
                      bgcolor: selected ? "action.selected" : "transparent",
                      cursor: "pointer",
                      transition: (theme) =>
                        theme.transitions.create("background-color", {
                          duration: theme.transitions.duration.shortest,
                        }),
                      "&:hover": {
                        bgcolor: selected
                          ? "action.selected"
                          : "action.hover",
                      },
                    }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <EmployeeProfile
                        name={row.employee.full_name}
                        subtitle={row.employee.email}
                        seed={row.employee.id}
                      />
                    </Box>

                    <Typography variant="body2" noWrap>
                      {row.employee.department ?? "-"}
                    </Typography>
                    <Typography variant="body2" sx={{ textAlign: "right" }}>
                      {formatLeaveDays(row.balance.total_days)}
                    </Typography>
                    <Typography variant="body2" sx={{ textAlign: "right" }}>
                      {formatLeaveDays(row.balance.used_days)}
                    </Typography>
                    <Typography variant="body2" sx={{ textAlign: "right" }}>
                      {formatLeaveDays(row.balance.remaining_days)}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        textAlign: "right",
                        color: "warning.main",
                        fontWeight: 700,
                      }}
                    >
                      {formatLeaveDays(row.balance.pending_days)}
                    </Typography>
                    <Box>
                      <LeaveUsageGauge
                        availableDays={row.balance.available_days}
                        totalDays={row.balance.total_days}
                      />
                    </Box>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ justifyContent: "center" }}
                      onClick={(event) => event.stopPropagation()}
                      onMouseDown={(event) => event.stopPropagation()}
                    >
                      <Button
                        size="small"
                        variant={selected ? "contained" : "outlined"}
                        color={selected ? "primary" : "inherit"}
                        onClick={(event) => {
                          event.stopPropagation();
                          onDetail(row.employee.id);
                        }}
                        sx={
                          selected
                            ? undefined
                            : {
                                borderColor: "divider",
                                color: "text.primary",
                              }
                        }
                      >
                        상세
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={(event) => {
                          event.stopPropagation();
                          onGrant(row.employee.id);
                        }}
                      >
                        부여
                      </Button>
                    </Stack>
                    <GridSpacer />
                  </Box>
                );
              })}
            </Box>
          </Box>

          <PaginationBar
            note={LEAVES_TABLE_UNIT_NOTE}
            page={page}
            pageCount={pageCount}
            onPageChange={onPageChange}
          />
        </>
      )}
    </Paper>
  );
};

export default EmployeeLeaveTable;
