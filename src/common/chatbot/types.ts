export type ReasonCode =
  | "INVALID_DATE_RANGE"
  | "NO_WORKING_DAYS"
  | "HALF_DAY_DISABLED"
  | "INVALID_HALF_DAY_RANGE"
  | "INSUFFICIENT_BALANCE"
  | "OVERLAPPING_REQUEST"
  | "ATTENDANCE_CONFLICT"
  | "AUTO_APPROVAL_DISABLED"
  | "EXCEEDS_MAX_CONSECUTIVE_DAYS"
  | "INSUFFICIENT_NOTICE";

export type LeaveBalance = {
  year: number;
  total_days: number;
  used_days: number;
  remaining_days: number;
  pending_days: number;
  available_days: number;
};

export type ClarificationOption = {
  label: string;
  value: string;
};

export type AnswerPayload = {
  balance?: LeaveBalance;
};

export type ClarificationPayload = {
  missing_fields: Array<"leave_type" | "start_date" | "end_date" | "reason">;
  options: ClarificationOption[];
};

export type LeavePreview = {
  leave_type_id: string;
  leave_type_name: string;
  start_date: string;
  end_date: string;
  total_days: number;
  balance: LeaveBalance;
  can_submit: boolean;
  expected_status: "approved" | "pending" | null;
  review_reasons: ReasonCode[];
  confirmation_token: string | null;
  expires_at: string | null;
};

export type BlockedPayload = {
  reason_codes: ReasonCode[];
  available_days?: number;
  requested_days?: number;
};

export type AnswerData = {
  conversation_id: string;
  type: "answer";
  message: string;
  payload: AnswerPayload;
};

export type ClarificationData = {
  conversation_id: string;
  type: "clarification";
  message: string;
  payload: ClarificationPayload;
};

export type LeaveConfirmationData = {
  conversation_id: string;
  type: "leave_confirmation";
  message: string;
  payload: LeavePreview;
};

export type BlockedData = {
  conversation_id: string;
  type: "blocked";
  message: string;
  payload: BlockedPayload;
};

export type ChatResponseData =
  | AnswerData
  | ClarificationData
  | LeaveConfirmationData
  | BlockedData;

export type ChatResponse = {
  data: ChatResponseData;
};

export type SubmittedLeave = {
  id: string;
  status: "approved" | "pending";
  approval_type: "auto" | null;
  total_days: number;
  decision_reason: string;
  message: string;
};

export type SubmitResponse = {
  data: SubmittedLeave;
};

export type QuickAction = {
  label: string;
  trigger: string;
};

export type ChatbotMock = {
  ui: {
    greeting: string;
    quick_actions: QuickAction[];
    tooltip: string;
    header_title: string;
    header_subtitle: string;
    input_placeholder: string;
    input_hint: string;
  };
  scenarios: Record<string, ChatResponse>;
  submit: {
    approved: SubmitResponse;
    pending: SubmitResponse;
  };
};

export type ChatRole = "user" | "assistant";

export type UserChatMessage = {
  id: string;
  role: "user";
  text: string;
};

export type AssistantChatMessage = {
  id: string;
  role: "assistant";
  response: ChatResponseData;
  submitted?: boolean;
  submitResult?: SubmittedLeave;
};

export type ChatMessage = UserChatMessage | AssistantChatMessage;
