import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import {
  Box,
  Button,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import AdminSectionHeader from "../../common/components/Admin/AdminSectionHeader";
import DepartmentSelect from "../../common/components/dropbox/DepartmentSelect";
import {
  ADMIN_LEAVES_DESCRIPTION,
  ADMIN_LEAVES_DETAIL_ANCHOR_ID,
  ADMIN_LEAVES_MAX_WIDTH,
  ADMIN_LEAVES_TITLE,
  DEFAULT_LEAVE_YEAR,
} from "../../configs/admin/leaves";
import { useAdminEmployeeLeaves } from "../../hooks/admin/useLeaves";
import { scrollToStackedDetail } from "../../utils/admin/admin";
import EmployeeLeaveDetailPanel from "./components/EmployeeLeaveDetailPanel";
import EmployeeLeaveTable from "./components/EmployeeLeaveTable";
import GrantLeaveDialog from "./components/GrantLeaveDialog";
import LeavesInfoSection from "./components/LeavesInfoSection";
import LeavesSkeleton from "./components/LeavesSkeleton";
import LeavesSummaryCards from "./components/LeavesSummaryCards";

const YEAR_OPTIONS = [DEFAULT_LEAVE_YEAR, DEFAULT_LEAVE_YEAR - 1];

const AdminLeavesPage = () => {
  const {
    filter,
    departments,
    filteredRows,
    pagedRows,
    summary,
    page,
    pageCount,
    grantOpen,
    grantTarget,
    detailTarget,
    allRows,
    error,
    isLoading,
    setYear,
    setSearch,
    setDepartment,
    setPage,
    openGrantDialog,
    closeGrantDialog,
    openDetailDialog,
    closeDetailDialog,
    grantLeave,
  } = useAdminEmployeeLeaves();

  const handleDetail = (employeeId: string) => {
    const willOpen = detailTarget?.employee.id !== employeeId;
    openDetailDialog(employeeId);
    if (willOpen) {
      scrollToStackedDetail(ADMIN_LEAVES_DETAIL_ANCHOR_ID);
    }
  };

  if (isLoading) {
    return <LeavesSkeleton />;
  }

  return (
    <Box sx={{ maxWidth: ADMIN_LEAVES_MAX_WIDTH, mx: "auto", py: 2 }}>
      <AdminSectionHeader
        title={ADMIN_LEAVES_TITLE}
        description={ADMIN_LEAVES_DESCRIPTION}
        action={
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => openGrantDialog()}
          >
            연차 부여
          </Button>
        }
      />

      <LeavesSummaryCards summary={summary} />

      <Stack
        direction={{ xs: "column", lg: "row" }}
        spacing={2}
        sx={{ alignItems: "stretch", minHeight: { lg: 640 } }}
      >
        <Box sx={{ flex: 1.55, minWidth: 0 }}>
          <EmployeeLeaveTable
            rows={pagedRows}
            totalCount={filteredRows.length}
            year={filter.year}
            page={page}
            pageCount={pageCount}
            selectedEmployeeId={detailTarget?.employee.id ?? null}
            onPageChange={setPage}
            onDetail={handleDetail}
            onGrant={openGrantDialog}
            toolbar={
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                sx={{ alignItems: { xs: "stretch", sm: "center" } }}
              >
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel id="admin-leave-year-label">연도</InputLabel>
                  <Select
                    labelId="admin-leave-year-label"
                    label="연도"
                    value={filter.year}
                    onChange={(e) => setYear(Number(e.target.value))}
                  >
                    {YEAR_OPTIONS.map((year) => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <DepartmentSelect
                  value={filter.department}
                  departments={departments}
                  onChange={setDepartment}
                />

                <TextField
                  size="small"
                  value={filter.search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="직원 이름 또는 이메일 검색"
                  sx={{ flex: 1, minWidth: { sm: 220 } }}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchRoundedIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Stack>
            }
          />
        </Box>

        {detailTarget ? (
          <Box
            id={ADMIN_LEAVES_DETAIL_ANCHOR_ID}
            sx={{
              flex: 1,
              minWidth: 0,
              maxWidth: { lg: 420 },
              scrollMarginTop: 16,
            }}
          >
            <EmployeeLeaveDetailPanel
              key={`${detailTarget.employee.id}-${detailTarget.balance.available_days}-${detailTarget.balance.pending_days}`}
              target={detailTarget}
              onClose={closeDetailDialog}
              onGrant={openGrantDialog}
            />
          </Box>
        ) : null}
      </Stack>

      <LeavesInfoSection />

      <GrantLeaveDialog
        key={grantTarget?.employee.id ?? "new"}
        open={grantOpen}
        employees={allRows.filter((row) => row.balance.year === filter.year)}
        initialEmployeeId={grantTarget?.employee.id ?? null}
        year={filter.year}
        error={error}
        onClose={closeGrantDialog}
        onSubmit={grantLeave}
      />
    </Box>
  );
};

export default AdminLeavesPage;
