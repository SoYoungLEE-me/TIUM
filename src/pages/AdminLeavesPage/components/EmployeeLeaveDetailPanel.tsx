import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import {
  Box,
  Button,
  Divider,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  alpha,
} from "@mui/material";
import LeaveStatusChip from "../../../common/components/Admin/LeaveStatusChip";
import { LEAVE_HISTORY_EMPTY } from "../../../configs/admin/leaves";
import type { EmployeeLeaveRow } from "../../../models/admin/leaves";
import { formatDateTime, formatLeavePeriod } from "../../../utils/admin/admin";
import { formatLeaveDays } from "../../../utils/admin/leaves";

type EmployeeLeaveDetailPanelProps = {
  target: EmployeeLeaveRow;
  onClose: () => void;
  onGrant: (employeeId: string) => void;
};

const thinHeadSx = {
  color: "text.secondary",
  fontWeight: 600,
  borderBottom: "1px solid",
  borderColor: "divider",
  py: 1.25,
};

const thinBodySx = {
  borderBottom: "1px solid",
  borderColor: "divider",
  py: 1.5,
};

const panelFadeSx = {
  animation: "leaveDetailFade 220ms ease",
  "@keyframes leaveDetailFade": {
    from: { opacity: 0.25 },
    to: { opacity: 1 },
  },
};

const EmployeeLeaveDetailPanel = ({
  target,
  onClose,
  onGrant,
}: EmployeeLeaveDetailPanelProps) => {
  const { employee, balance, requests = [], history = [] } = target;

  return (
    <Paper
      variant="outlined"
      sx={{
        height: "100%",
        minHeight: 320,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        ...panelFadeSx,
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{
          px: 2,
          py: 1.5,
          alignItems: "flex-start",
          justifyContent: "space-between",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box sx={{ minWidth: 0, pr: 1 }}>
          <Typography sx={{ fontWeight: 700, color: "primary.main" }} noWrap>
            {employee.full_name}님의 연차
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.35 }}>
            {balance.year}년 · {employee.department ?? "-"} · {employee.email}
          </Typography>
        </Box>
        <IconButton aria-label="닫기" onClick={onClose} size="small">
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </Stack>

      <Box
        sx={(theme) => ({
          p: 2,
          overflow: "auto",
          flex: 1,
          scrollbarWidth: "thin",
          scrollbarColor: `${alpha(theme.palette.primary.main, 0.45)} transparent`,
          "&::-webkit-scrollbar": { width: 6 },
          "&::-webkit-scrollbar-track": { backgroundColor: "transparent" },
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
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            p: 1.75,
            mb: 1.5,
          }}
        >
          <Stack
            direction="row"
            divider={<Divider orientation="vertical" flexItem />}
            spacing={0}
          >
            {[
              { label: "잔여 연차", value: balance.remaining_days },
              { label: "검토 대기", value: balance.pending_days },
              { label: "신청 가능", value: balance.available_days },
            ].map((item) => (
              <Box
                key={item.label}
                sx={{ flex: 1, px: 1, textAlign: "center" }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 0.5 }}
                >
                  {item.label}
                </Typography>
                <Typography
                  sx={{ fontWeight: 700, color: "primary.main", fontSize: 20 }}
                >
                  {formatLeaveDays(item.value)}일
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.25 }}>
          총 부여 {formatLeaveDays(balance.total_days)}일 · 사용{" "}
          {formatLeaveDays(balance.used_days)}일 · 검토 대기는 잔여에서 차감하지
          않고 신청 가능에서만 제외됩니다.
        </Typography>

        <Typography sx={{ fontWeight: 700, mb: 1 }}>신청 내역</Typography>
        <Table size="small" sx={{ mb: 2.5 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={thinHeadSx}>유형</TableCell>
              <TableCell sx={thinHeadSx}>기간</TableCell>
              <TableCell align="right" sx={thinHeadSx}>
                일수
              </TableCell>
              <TableCell sx={thinHeadSx}>상태</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} sx={thinBodySx}>
                  <Typography variant="body2" color="text.secondary">
                    신청 내역이 없습니다.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell sx={thinBodySx}>
                    {request.leave_type_name}
                  </TableCell>
                  <TableCell sx={thinBodySx}>
                    {formatLeavePeriod(request.start_date, request.end_date)}
                  </TableCell>
                  <TableCell align="right" sx={thinBodySx}>
                    {formatLeaveDays(request.total_days)}
                  </TableCell>
                  <TableCell sx={thinBodySx}>
                    <LeaveStatusChip status={request.status} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <Typography sx={{ fontWeight: 700, mb: 1 }}>연차 변동 이력</Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={thinHeadSx}>구분</TableCell>
              <TableCell align="right" sx={thinHeadSx}>
                변동
              </TableCell>
              <TableCell sx={thinHeadSx}>사유</TableCell>
              <TableCell sx={thinHeadSx}>처리일</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {history.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} sx={thinBodySx}>
                  <Typography variant="body2" color="text.secondary">
                    {LEAVE_HISTORY_EMPTY}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              history.map((item) => (
                <TableRow key={item.id}>
                  <TableCell sx={thinBodySx}>{item.category}</TableCell>
                  <TableCell align="right" sx={thinBodySx}>
                    +{formatLeaveDays(item.change_days)}
                  </TableCell>
                  <TableCell sx={thinBodySx}>{item.reason}</TableCell>
                  <TableCell sx={thinBodySx}>
                    {formatDateTime(item.processed_at)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Box>

      <Stack
        direction="row"
        spacing={1.25}
        sx={{
          p: 2,
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Button
          variant="outlined"
          color="inherit"
          fullWidth
          onClick={onClose}
          sx={{ borderColor: "divider", color: "text.primary" }}
        >
          닫기
        </Button>
        <Button
          variant="contained"
          fullWidth
          onClick={() => onGrant(employee.id)}
        >
          연차 부여
        </Button>
      </Stack>
    </Paper>
  );
};

export default EmployeeLeaveDetailPanel;
