import type { ChatRequest, ChatResponse } from "../models/apis/assistant";
import { invokeFunction } from "./apiRequest";

export const sendAssistantMessage = async (
  body: ChatRequest
): Promise<ChatResponse> =>
  invokeFunction<ChatResponse>("assistant-messages", body);
