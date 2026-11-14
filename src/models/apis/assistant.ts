export type {
  ChatResponse,
  ChatResponseData,
  LeavePreview,
  ReasonCode,
  SubmittedLeave,
  SubmitResponse,
} from "../chatbot/chatbot";

export type ChatRequest = {
  conversation_id?: string | null;
  message: string;
};
