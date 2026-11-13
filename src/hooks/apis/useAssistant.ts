import { useMutation } from "@tanstack/react-query";
import { sendAssistantMessage } from "../../apis/assistant";
import type { ChatRequest } from "../../models/apis/assistant";

export const useSendAssistantMessage = () =>
  useMutation({
    mutationFn: (body: ChatRequest) => sendAssistantMessage(body),
  });
