import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Alert, Box, Stack, Typography } from "@mui/material";
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
import AdminSkeleton from "./components/AdminSkeleton";
import PendingRequestList from "./components/PendingRequestList";
import RequestReviewActions from "./components/RequestReviewActions";
import ReviewSummaryCards from "./components/ReviewSummaryCards";

const AdminPage = () => {
  const {
    filter,
    pagedRequests,
    page,
    pageCount,
    selectedRequest,
    selectedIndex,
    summary,
    statusCounts,
    departments,
    actionError,
    processing,
    isLoading,
    isError,
    errorMessage,
    setStatusFilter,
    setSearch,
    setDepartment,
    setPage,
    selectRequest,
    approveRequest,
    rejectRequest,
  } = useAdminLeaveReview();

  const handleSelect = (id: string) => {
    selectRequest(id);
    scrollToStackedDetail(ADMIN_REVIEW_DETAIL_ANCHOR_ID);
  };

  if (isLoading) {
    return <AdminSkeleton />;
  }

  return (
    <Box sx={{ maxWidth: ADMIN_REVIEW_MAX_WIDTH, mx: "auto", py: 2 }}>
      <AdminSectionHeader
        title={ADMIN_REVIEW_TITLE}
        description={ADMIN_REVIEW_DESCRIPTION}
      />

      {isError && errorMessage ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      ) : null}

      <ReviewSummaryCards summary={summary} />

      <Stack
        direction={{ xs: "column", lg: "row" }}
        spacing={2}
        sx={{ alignItems: "stretch", minHeight: { lg: 640 } }}
      >
        <Box sx={{ flex: 1.55, minWidth: 0 }}>
          <PendingRequestList
            requests={pagedRequests}
            selectedId={selectedRequest?.id ?? null}
            filter={filter}
            statusCounts={statusCounts}
            departments={departments}
            page={page}
            pageCount={pageCount}
            onSelect={handleSelect}
            onStatusChange={setStatusFilter}
            onSearchChange={setSearch}
            onDepartmentChange={setDepartment}
            onPageChange={setPage}
          />
        </Box>
        {selectedRequest ? (
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
              key={`${selectedRequest.id}-${selectedRequest.status}-${selectedRequest.balance.available_days}-${selectedRequest.balance.pending_days}`}
              request={selectedRequest}
              selectedIndex={selectedIndex}
              processing={processing}
              actionError={actionError}
              onApprove={approveRequest}
              onReject={rejectRequest}
            />
          </Box>
        ) : null}
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
