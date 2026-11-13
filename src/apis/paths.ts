/** OpenAPI paths — axios baseURL(VITE_API_BASE_URL) 기준 */
export const API_PATHS = {
  assistantMessages: "/api/assistant/messages",
  me: "/api/me",
  dashboard: "/api/dashboard",
  attendanceCheckIn: "/api/attendance/check-in",
  attendanceCheckOut: "/api/attendance/check-out",
  attendance: "/api/attendance",
  leavesBalance: "/api/leaves/balance",
  leaves: "/api/leaves",
  leavesValidate: "/api/leaves/validate",
  leaveById: (requestId: string) => `/api/leaves/${requestId}`,
  companyPolicy: "/api/company-policy",
  adminLeaves: "/api/admin/leaves",
  adminLeaveById: (requestId: string) => `/api/admin/leaves/${requestId}`,
  adminLeaveApprove: (requestId: string) =>
    `/api/admin/leaves/${requestId}/approve`,
  adminLeaveReject: (requestId: string) =>
    `/api/admin/leaves/${requestId}/reject`,
  adminEmployeeBalances: "/api/admin/employees/balances",
  adminLeaveGrants: "/api/admin/leave-grants",
  adminSettings: "/api/admin/settings",
};
