import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import {
  Box,
  ButtonBase,
  InputAdornment,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import LeaveStatusChip from "../../../common/components/Admin/LeaveStatusChip";
import DepartmentSelect from "../../../common/components/dropbox/DepartmentSelect";
import PaginationBar from "../../../common/components/pagenation";
import EmployeeProfile from "../../../common/components/profile/EmployeeProfile";
import {
  ADMIN_LEAVE_STATUS_TABS,
  ADMIN_REVIEW_LIST_UNIT_NOTE,
} from "../../../configs/admin/admin";
import type {
  AdminLeaveFilter,
  AdminLeaveRequest,
  AdminStatusCounts,
} from "../../../models/admin/admin";
import { formatLeavePeriod } from "../../../utils/admin/admin";

type PendingRequestListProps = {
  requests: AdminLeaveRequest[];
  selectedId: string | null;
  filter: AdminLeaveFilter;
  statusCounts: AdminStatusCounts;
  departments: string[];
  page: number;
  pageCount: number;
  onSelect: (id: string) => void;
  onStatusChange: (status: AdminLeaveFilter["status"]) => void;
  onSearchChange: (value: string) => void;
  onDepartmentChange: (value: string) => void;
  onPageChange: (page: number) => void;
};

const PendingRequestList = ({
  requests,
  selectedId,
  filter,
  statusCounts,
  departments,
  page,
  pageCount,
  onSelect,
  onStatusChange,
  onSearchChange,
  onDepartmentChange,
  onPageChange,
}: PendingRequestListProps) => {
  return (
    <Paper
      variant="outlined"
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Box sx={{ px: 2, pt: 1.5, borderBottom: "1px solid", borderColor: "divider" }}>
        <Typography variant="h2" sx={{ mb: 1 }}>
          연차 신청 목록
        </Typography>
        <Tabs
          value={filter.status}
          onChange={(_, value) => onStatusChange(value)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 40,
            "& .MuiTab-root": {
              minHeight: 40,
              textTransform: "none",
              fontWeight: 600,
              fontSize: 13,
            },
          }}
        >
          {ADMIN_LEAVE_STATUS_TABS.map((tab) => (
            <Tab
              key={tab.value}
              value={tab.value}
              label={`${tab.label} ${statusCounts[tab.value]}`}
            />
          ))}
        </Tabs>
      </Box>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        sx={{ p: 1.5, borderBottom: "1px solid", borderColor: "divider" }}
      >
        <TextField
          size="small"
          value={filter.search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="직원명, 부서 검색"
          fullWidth
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" color="disabled" />
                </InputAdornment>
              ),
            },
          }}
        />
        <DepartmentSelect
          value={filter.department}
          departments={departments}
          onChange={onDepartmentChange}
          minWidth={{ sm: 140 }}
        />
      </Stack>

      <Box sx={{ overflow: "auto", flex: 1, minWidth: 0 }}>
        {requests.length === 0 ? (
          <Box sx={{ p: 3 }}>
            <Typography color="text.secondary">
              표시할 신청이 없습니다.
            </Typography>
          </Box>
        ) : (
          requests.map((request) => {
            const selected = request.id === selectedId;

            return (
              <ButtonBase
                key={request.id}
                onClick={() => onSelect(request.id)}
                focusRipple
                sx={{
                  display: "block",
                  width: "100%",
                  px: 2,
                  py: 1.5,
                  textAlign: "left",
                  borderRadius: 0,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  bgcolor: selected ? "action.selected" : "transparent",
                  borderLeft: "3px solid",
                  borderLeftColor: selected ? "primary.main" : "transparent",
                  transition: (theme) =>
                    theme.transitions.create("background-color", {
                      duration: theme.transitions.duration.shortest,
                    }),
                  "&:hover": {
                    bgcolor: selected ? "action.selected" : "action.hover",
                  },
                }}
              >
                {/* 모바일: 프로필 | 연차·일수·기간 | 상태 — 1:1:1 */}
                <Box
                  sx={{
                    display: { xs: "grid", sm: "none" },
                    gridTemplateColumns: "1fr 1fr 1fr",
                    columnGap: 1,
                    alignItems: "center",
                    minWidth: 0,
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <EmployeeProfile
                      name={request.employee_full_name}
                      subtitle={request.department ?? "-"}
                      seed={request.employee_id}
                    />
                  </Box>
                  <Stack
                    direction="row"
                    spacing={0.75}
                    useFlexGap
                    sx={{
                      alignItems: "center",
                      justifyContent: "center",
                      flexWrap: "wrap",
                      minWidth: 0,
                      rowGap: 0.25,
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {request.leave_type_name}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {request.total_days.toFixed(1)}일
                    </Typography>
                    <Typography variant="subtitle1">
                      {formatLeavePeriod(request.start_date, request.end_date)}
                    </Typography>
                  </Stack>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      minWidth: 0,
                    }}
                  >
                    <LeaveStatusChip status={request.status} />
                  </Box>
                </Box>

                {/* sm+: 기존 그리드 */}
                <Box
                  sx={{
                    display: { xs: "none", sm: "grid" },
                    gridTemplateColumns: "1.4fr 1.3fr 0.7fr 0.9fr",
                    gap: 1,
                    alignItems: "center",
                  }}
                >
                  <EmployeeProfile
                    name={request.employee_full_name}
                    subtitle={request.department ?? "-"}
                    seed={request.employee_id}
                  />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                      {request.leave_type_name}
                    </Typography>
                    <Typography variant="subtitle1" noWrap>
                      {formatLeavePeriod(request.start_date, request.end_date)}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                    {request.total_days.toFixed(1)}일
                  </Typography>
                  <Box sx={{ minWidth: 0 }}>
                    <LeaveStatusChip status={request.status} />
                  </Box>
                </Box>
              </ButtonBase>
            );
          })
        )}
      </Box>

      {requests.length > 0 ? (
        <PaginationBar
          note={ADMIN_REVIEW_LIST_UNIT_NOTE}
          page={page}
          pageCount={pageCount}
          onPageChange={onPageChange}
        />
      ) : null}
    </Paper>
  );
};

export default PendingRequestList;
