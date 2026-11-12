import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Box, Stack, Typography } from "@mui/material";
import AdminSectionHeader from "../../common/components/Admin/AdminSectionHeader";
import {
  ADMIN_REVIEW_DESCRIPTION,
  ADMIN_REVIEW_DETAIL_ANCHOR_ID,
  ADMIN_REVIEW_FOOTER_TIP,
  ADMIN_REVIEW_MAX_WIDTH,
  ADMIN_REVIEW_TITLE,
} from "../../configs/admin/admin";
import { useAdminLeaveReview } from "../../hooks/admin/useAdmin";
import { scrollToStackedDetail } from "../../utils/admin/admin";
import PendingRequestList from "./components/PendingRequestList";
import RequestReviewActions from "./components/RequestReviewActions";
import ReviewSummaryCards from "./components/ReviewSummaryCards";

const AdminPage = () => {
  const {
    filter,
    filteredRequests,
    selectedRequest,
    selectedIndex,
    summary,
    statusCounts,
    departments,
    actionError,
    actionMessage,
    processing,
    setStatusFilter,
    setSearch,
    setDepartment,
    selectRequest,
    approveRequest,
    rejectRequest,
  } = useAdminLeaveReview();

  const handleSelect = (id: string) => {
    selectRequest(id);
    scrollToStackedDetail(ADMIN_REVIEW_DETAIL_ANCHOR_ID);
  };

  return (
    <Box sx={{ maxWidth: ADMIN_REVIEW_MAX_WIDTH, mx: "auto", py: 2 }}>
      <AdminSectionHeader
        title={ADMIN_REVIEW_TITLE}
        description={ADMIN_REVIEW_DESCRIPTION}
      />

      <ReviewSummaryCards summary={summary} />

      <Stack
        direction={{ xs: "column", lg: "row" }}
        spacing={2}
        sx={{ alignItems: "stretch", minHeight: { lg: 640 } }}
      >
        <Box sx={{ flex: 1.55, minWidth: 0 }}>
          <PendingRequestList
            requests={filteredRequests}
            selectedId={selectedRequest?.id ?? null}
            filter={filter}
            statusCounts={statusCounts}
            departments={departments}
            onSelect={handleSelect}
            onStatusChange={setStatusFilter}
            onSearchChange={setSearch}
            onDepartmentChange={setDepartment}
          />
        </Box>
        <Box
          id={ADMIN_REVIEW_DETAIL_ANCHOR_ID}
          sx={{
            flex: 1,
            minWidth: 0,
            maxWidth: { lg: 420 },
            scrollMarginTop: 16,
          }}
        >
          <RequestReviewActions
            key={
              selectedRequest
                ? `${selectedRequest.id}-${selectedRequest.status}-${selectedRequest.balance.available_days}-${selectedRequest.balance.pending_days}`
                : "empty"
            }
            request={selectedRequest}
            selectedIndex={selectedIndex}
            processing={processing}
            actionError={actionError}
            actionMessage={actionMessage}
            onApprove={approveRequest}
            onReject={rejectRequest}
          />
        </Box>
      </Stack>

      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: "flex-start", mt: 2, px: 0.5 }}
      >
        <InfoOutlinedIcon
          sx={{ fontSize: 18, color: "text.secondary", mt: "2px" }}
        />
        <Typography variant="body2" color="text.secondary">
          {ADMIN_REVIEW_FOOTER_TIP}
        </Typography>
      </Stack>
    </Box>
  );
};

export default AdminPage;
