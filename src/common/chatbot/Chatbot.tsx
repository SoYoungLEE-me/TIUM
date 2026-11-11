import { useEffect, useMemo, useRef, useState } from "react";
import mockData from "./Mock.json";
import ChatPanel from "./components/ChatPanel";
import FloatingButton from "./components/FloatingButton";
import type {
  AssistantChatMessage,
  ChatMessage,
  ChatResponseData,
  ChatbotMock,
  LeavePreview,
  UserChatMessage,
} from "./types";

const mock = mockData as ChatbotMock;
const PANEL_ANIMATION_MS = 280;
const REPLY_DELAY_MS = 700;

const createId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const findScenario = (input: string): ChatResponseData | null => {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const exact = mock.scenarios[trimmed];
  if (exact) return exact.data;

  const entries = Object.entries(mock.scenarios);
  const partial = entries.find(
    ([key]) => trimmed.includes(key) || key.includes(trimmed)
  );
  if (partial) return partial[1].data;

  if (trimmed.includes("규정")) {
    return mock.scenarios["회사 휴가 규정"].data;
  }
  if (trimmed.includes("잔여") || trimmed.includes("연차 몇")) {
    return mock.scenarios["잔여 연차 확인"].data;
  }
  if (trimmed.includes("부족")) {
    return mock.scenarios["연차 부족"].data;
  }
  if (trimmed.includes("반차") || trimmed.includes("신청")) {
    return mock.scenarios["반차 신청"].data;
  }

  return {
    conversation_id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    type: "answer",
    message:
      "연차 조회·규정 안내·휴가 신청을 도와드릴 수 있어요. 예: “잔여 연차 확인”, “금요일 오전 반차 신청해 줘”",
    payload: {},
  };
};

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [panelMounted, setPanelMounted] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submittingMessageId, setSubmittingMessageId] = useState<string | null>(
    null
  );
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadingRef = useRef(false);

  const showQuickActions = useMemo(
    () => messages.length === 0,
    [messages.length]
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

    const response = findScenario(text);
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
    void _messageId; // TODO: 실제 수정 기능 구현 시 제거
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
    payload: LeavePreview
  ) => {
    if (!payload.can_submit || !payload.confirmation_token) return;
    if (loadingRef.current) return;

    setSubmittingMessageId(messageId);
    loadingRef.current = true;
    setLoading(true);
    await wait(600);

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
      })
    );

    const resultMessage: AssistantChatMessage = {
      id: createId(),
      role: "assistant",
      response: {
        conversation_id:
          conversationId ?? "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
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

  return (
    <>
      <FloatingButton visible={!panelMounted} onOpen={handleOpen} />
      {panelMounted && (
        <ChatPanel
          ref={panelRef}
          open={open}
          title={mock.ui.header_title}
          subtitle={mock.ui.header_subtitle}
          greeting={mock.ui.greeting}
          quickActions={mock.ui.quick_actions}
          showQuickActions={showQuickActions}
          messages={messages}
          placeholder={mock.ui.input_placeholder}
          hint={mock.ui.input_hint}
          loading={loading}
          submittingMessageId={submittingMessageId}
          onClose={handleClose}
          onEndConversation={handleEndConversation}
          onSend={handleSend}
          onQuickAction={handleSend}
          onClarificationSelect={handleSend}
          onEditLeave={(messageId) => {
            void handleEditLeave(messageId);
          }}
          onSubmitLeave={handleSubmitLeave}
        />
      )}
    </>
  );
};

export default Chatbot;
