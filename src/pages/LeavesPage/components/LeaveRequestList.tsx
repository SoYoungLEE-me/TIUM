import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import LeaveStatusChip from "../../../common/components/Employee/LeaveStatusChip";
import type {
  LeaveFilter,
  LeaveHistoryItem,
} from "../../../models/employee/leaves";
import { formatLeavePeriod } from "../../../utils/employee/dashboard";
import { formatAppliedDate } from "../../../utils/employee/leaves";

type FilterOption = { value: LeaveFilter; label: string; count: number };

type LeaveRequestListProps = {
  requests: LeaveHistoryItem[];
  filter: LeaveFilter;
  filterOptions: FilterOption[];
  onChangeFilter: (filter: LeaveFilter) => void;
};

const HEAD_CELLS = ["신청일", "사용 기간", "유형", "차감", "처리 내용", "상태"];

const LeaveRequestList = ({
  requests,
  filter,
  filterOptions,
  onChangeFilter,
}: LeaveRequestListProps) => (
  <Paper
    sx={{
      p: { xs: 2, md: 3 },
      display: "flex",
      flexDirection: "column",
      gap: 2,
    }}
  >
    {/* 제목 + 필터 */}
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1.5,
      }}
    >
      <Typography variant="h2" component="h2">
        신청 내역
      </Typography>
      <Box
        role="group"
        aria-label="신청 상태 필터"
        sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}
      >
        {filterOptions.map((option) => {
          const selected = option.value === filter;
          return (
            <Button
              key={option.value}
              size="small"
              variant={selected ? "contained" : "outlined"}
              aria-pressed={selected}
              onClick={() => onChangeFilter(option.value)}
              sx={{
                minHeight: 36,
                px: 1.75,
                ...(selected
                  ? {
                      bgcolor: "sidebar.bg",
                      color: "#FFFFFF",
                      "&:hover": { bgcolor: "sidebar.bg" },
                    }
                  : { borderColor: "divider", color: "text.primary" }),
              }}
            >
              {option.label} {option.count}
            </Button>
          );
        })}
      </Box>
    </Box>

    {requests.length === 0 ? (
      <Typography color="text.secondary" sx={{ py: 6, textAlign: "center" }}>
        해당하는 신청 내역이 없어요.
      </Typography>
    ) : (
      <>
        {/* 데스크톱: 표 */}
        <Box sx={{ display: { xs: "none", md: "block" }, overflowX: "auto" }}>
          <Table sx={{ minWidth: 720 }}>
            <TableHead>
              <TableRow>
                {HEAD_CELLS.map((label) => (
                  <TableCell
                    key={label}
                    sx={{
                      color: "text.secondary",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.map((request) => (
                <TableRow
                  key={request.id}
                  sx={{ "&:last-of-type td": { borderBottom: 0 } }}
                >
                  <TableCell
                    sx={{ color: "text.secondary", whiteSpace: "nowrap" }}
                  >
                    {formatAppliedDate(request.created_at)}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                    {formatLeavePeriod(request.start_date, request.end_date)}
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: 14 }}>
                      {request.leave_type_name}
                    </Typography>
                    {request.reason && (
                      <Typography variant="body2" color="text.secondary">
                        {request.reason}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    {request.status === "rejected"
                      ? "미차감"
                      : `${request.total_days}일`}
                  </TableCell>
                  <TableCell sx={{ color: "text.secondary", maxWidth: 280 }}>
                    {request.decision_reason ?? "-"}
                  </TableCell>
                  <TableCell>
                    <LeaveStatusChip
                      status={request.status}
                      approvalType={request.approval_type}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>

        {/* 모바일: 카드 */}
        <Box
          sx={{ display: { xs: "flex", md: "none" }, flexDirection: "column" }}
        >
          {requests.map((request) => (
            <Box
              key={request.id}
              sx={{
                py: 1.75,
                borderTop: 1,
                borderColor: "divider",
                display: "flex",
                flexDirection: "column",
                gap: 0.75,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Typography sx={{ fontWeight: 700 }}>
                  {request.leave_type_name} ·{" "}
                  {request.status === "rejected"
                    ? "미차감"
                    : `${request.total_days}일`}
                </Typography>
                <LeaveStatusChip
                  status={request.status}
                  approvalType={request.approval_type}
                />
              </Box>
              <Typography variant="body2">
                {formatLeavePeriod(request.start_date, request.end_date)}
              </Typography>
              {request.decision_reason && (
                <Typography variant="body2" color="text.secondary">
                  {request.decision_reason}
                </Typography>
              )}
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: 12 }}
              >
                신청일 {formatAppliedDate(request.created_at)}
              </Typography>
            </Box>
          ))}
        </Box>
      </>
    )}
  </Paper>
);

export default LeaveRequestList;
