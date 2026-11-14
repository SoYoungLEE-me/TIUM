export const queryKeys = {
  me: ["me"],
  dashboard: ["dashboard"],
  attendance: (month?: string) => ["attendance", month ?? "all"],
  leaveBalance: (year?: number) => ["leaveBalance", year ?? "current"],
  leaveRequests: (filters?: Record<string, unknown>) => [
    "leaveRequests",
    filters ?? {},
  ],
  leaveRequest: (id: string) => ["leaveRequest", id],
  companyPolicy: ["companyPolicy"],
  adminLeaves: (filters?: Record<string, unknown>) => [
    "adminLeaves",
    filters ?? {},
  ],
  adminLeave: (id: string) => ["adminLeave", id],
  adminEmployeeBalances: (filters?: Record<string, unknown>) => [
    "adminEmployeeBalances",
    filters ?? {},
  ],
  adminEmployeeLeaveDetail: (employeeId: string, year: number) => [
    "adminEmployeeLeaveDetail",
    employeeId,
    year,
  ],
  adminSettings: ["adminSettings"],
  inquiryUnread: (variant: string) => ["inquiryUnread", variant],
  inquiryThreads: (scope: string) => ["inquiryThreads", scope],
  inquiryMessages: (threadId: string) => ["inquiryMessages", threadId],
  notifications: (variant: string) => ["notifications", variant],
};
