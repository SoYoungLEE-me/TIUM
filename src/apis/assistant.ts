import type { ChatRequest, ChatResponse } from "../models/apis/assistant";
import { apiRequest } from "./apiRequest";
import { API_PATHS } from "./paths";

export const sendAssistantMessage = async (
  body: ChatRequest
): Promise<ChatResponse> => {
  const { data } = await apiRequest.post<ChatResponse>(
    API_PATHS.assistantMessages,
    body
  );
  return data;
};
