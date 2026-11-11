import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import {
  Avatar,
  Box,
  ButtonBase,
  FormControl,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import LeaveStatusChip from "../../../common/components/Admin/LeaveStatusChip";
import { ADMIN_LEAVE_STATUS_TABS } from "../../../configs/admin/admin";
import type {
  AdminLeaveFilter,
  AdminLeaveRequest,
  AdminStatusCounts,
} from "../../../models/admin/admin";
import {
  formatDateTime,
  formatLeavePeriod,
  getAvatarColor,
  getInitials,
} from "../../../utils/admin/admin";

type PendingRequestListProps = {
  requests: AdminLeaveRequest[];
  selectedId: string | null;
  filter: AdminLeaveFilter;
  statusCounts: AdminStatusCounts;
  departments: string[];
  onSelect: (id: string) => void;
  onStatusChange: (status: AdminLeaveFilter["status"]) => void;
  onSearchChange: (value: string) => void;
  onDepartmentChange: (value: string) => void;
};

const PendingRequestList = ({
  requests,
  selectedId,
  filter,
  statusCounts,
  departments,
  onSelect,
  onStatusChange,
  onSearchChange,
  onDepartmentChange,
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
        <FormControl size="small" sx={{ minWidth: { sm: 140 } }}>
          <Select
            value={filter.department}
            onChange={(e) => onDepartmentChange(e.target.value)}
            displayEmpty
          >
            <MenuItem value="all">전체 부서</MenuItem>
            {departments.map((department) => (
              <MenuItem key={department} value={department}>
                {department}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      <Box sx={{ overflow: "auto", flex: 1 }}>
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
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "1.4fr 1.3fr 0.7fr 0.8fr 0.9fr",
                  },
                  gap: 1,
                  alignItems: "center",
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
                <Stack
                  direction="row"
                  spacing={1.25}
                  sx={{ alignItems: "center", minWidth: 0 }}
                >
                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      fontSize: 13,
                      fontWeight: 700,
                      bgcolor: getAvatarColor(request.employee_full_name),
                    }}
                  >
                    {getInitials(request.employee_full_name)}
                  </Avatar>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {request.employee_full_name}
                    </Typography>
                    <Typography variant="subtitle1" noWrap>
                      {request.department ?? "-"}
                    </Typography>
                  </Box>
                </Stack>

                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {request.leave_type_name}
                  </Typography>
                  <Typography variant="subtitle1">
                    {formatLeavePeriod(request.start_date, request.end_date)}
                  </Typography>
                </Box>

                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {request.total_days.toFixed(1)}일
                </Typography>

                <Box>
                  <LeaveStatusChip status={request.status} />
                </Box>

                <Typography variant="body2" color="text.secondary">
                  {formatDateTime(request.created_at)}
                </Typography>
              </ButtonBase>
            );
          })
        )}
      </Box>
    </Paper>
  );
};

export default PendingRequestList;
