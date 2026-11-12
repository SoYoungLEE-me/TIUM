import { useEffect, useMemo, useRef, useState } from "react";
import {
  DEFAULT_CONVERSATION_ID,
  PANEL_ANIMATION_MS,
  REPLY_DELAY_MS,
  SUBMIT_DELAY_MS,
} from "../../configs/chatbot/chatbot";
import mockData from "../../mocks/chatbot/chatbot.json";
import type {
  AssistantChatMessage,
  ChatMessage,
  ChatbotMock,
  LeavePreview,
  UserChatMessage,
} from "../../models/chatbot/chatbot";
import {
  createId,
  findScenario,
  wait,
} from "../../utils/chatbot/chatbot";

const mock = mockData as ChatbotMock;

export const useChatbot = () => {
  const [open, setOpen] = useState(false);
  const [panelMounted, setPanelMounted] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submittingMessageId, setSubmittingMessageId] = useState<string | null>(
    null,
  );
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadingRef = useRef(false);

  const showQuickActions = useMemo(
    () => messages.length === 0,
    [messages.length],
  );

  const resetConversation = () => {
    setMessages([]);
    setConversationId(null);
    setSubmittingMessageId(null);
    setLoading(false);
    loadingRef.current = false;
  };

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const handleOpen = () => {
    clearCloseTimer();
    setPanelMounted(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setOpen(true));
    });
  };

  const handleClose = () => {
    setOpen(false);
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      setPanelMounted(false);
      closeTimerRef.current = null;
    }, PANEL_ANIMATION_MS);
  };

  const handleEndConversation = () => {
    resetConversation();
  };

  useEffect(() => {
    return () => clearCloseTimer();
  }, []);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (panelRef.current?.contains(target)) return;
      handleClose();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  const appendExchange = async (text: string) => {
    if (loadingRef.current) return;

    const userMessage: UserChatMessage = {
      id: createId(),
      role: "user",
      text,
    };

    loadingRef.current = true;
    setLoading(true);
    setMessages((prev) => [...prev, userMessage]);

    await wait(REPLY_DELAY_MS);

    const response = findScenario(text, mock);
    if (!response) {
      loadingRef.current = false;
      setLoading(false);
      return;
    }

    const assistantMessage: AssistantChatMessage = {
      id: createId(),
      role: "assistant",
      response,
    };

    setConversationId(response.conversation_id);
    setMessages((prev) => [...prev, assistantMessage]);
    loadingRef.current = false;
    setLoading(false);
  };

  const handleSend = (message: string) => {
    void appendExchange(message);
  };

  const handleEditLeave = async (_messageId: string) => {
    void _messageId;
    if (loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);
    await wait(REPLY_DELAY_MS);

    const clarification = mock.scenarios["반차 신청"].data;
    const assistantMessage: AssistantChatMessage = {
      id: createId(),
      role: "assistant",
      response: clarification,
    };
    setConversationId(clarification.conversation_id);
    setMessages((prev) => [...prev, assistantMessage]);
    loadingRef.current = false;
    setLoading(false);
  };

  const handleSubmitLeave = async (
    messageId: string,
    payload: LeavePreview,
  ) => {
    if (!payload.can_submit || !payload.confirmation_token) return;
    if (loadingRef.current) return;

    setSubmittingMessageId(messageId);
    loadingRef.current = true;
    setLoading(true);
    await wait(SUBMIT_DELAY_MS);

    const submitKey =
      payload.expected_status === "pending" ? "pending" : "approved";
    const result = mock.submit[submitKey].data;

    setMessages((prev) =>
      prev.map((message) => {
        if (message.id !== messageId || message.role !== "assistant") {
          return message;
        }
        return {
          ...message,
          submitted: true,
          submitResult: result,
        };
      }),
    );

    const resultMessage: AssistantChatMessage = {
      id: createId(),
      role: "assistant",
      response: {
        conversation_id: conversationId ?? DEFAULT_CONVERSATION_ID,
        type: "answer",
        message: result.message,
        payload: {},
      },
    };

    setMessages((prev) => [...prev, resultMessage]);
    setSubmittingMessageId(null);
    loadingRef.current = false;
    setLoading(false);
  };

  return {
    open,
    panelMounted,
    panelRef,
    messages,
    loading,
    submittingMessageId,
    showQuickActions,
    ui: mock.ui,
    handleOpen,
    handleClose,
    handleEndConversation,
    handleSend,
    handleEditLeave,
    handleSubmitLeave,
  };
};
