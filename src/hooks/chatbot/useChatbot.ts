import { useEffect, useMemo, useRef, useState } from "react";
import { sendAssistantMessage } from "../../apis/assistant";
import {
  createInquiryThread,
  deleteInquiry,
  getInquiryMessages,
  getInquiryThread,
  insertInquirySystemMessage,
  listMyInquiryThreads,
  markInquiryRead,
  sendInquiryMessage,
  subscribeInquiryMessages,
  subscribeInquiryThreads,
  type InquiryMessage,
  type InquiryThread,
} from "../../apis/inquiries";
import { getMe } from "../../apis/me";
import { submitLeaveFromToken } from "../../apis/leaves";
import {
  CHATBOT_UI,
  isSeoulLunchTime,
  PANEL_ANIMATION_MS,
} from "../../configs/chatbot/chatbot";
import type {
  AssistantChatMessage,
  ChatMessage,
  ChatResponseData,
  LeavePreview,
  QuickAction,
  UserChatMessage,
} from "../../models/chatbot/chatbot";
import { ApiRequestError } from "../../models/apis/common";
import { toast } from "../../common/components/toast";
import { createId } from "../../utils/chatbot/chatbot";

export type ChatbotMode = "assistant" | "inquiry_list" | "inquiry_thread";

const DRAFT_THREAD_ID = "__draft__";

const buildConnectingMessages = (): string[] => {
  const lines: string[] = [CHATBOT_UI.inquiry_connecting];
  if (isSeoulLunchTime()) {
    lines.push(CHATBOT_UI.inquiry_lunch_extra);
  }
  return lines;
};

export const useChatbot = () => {
  const [open, setOpen] = useState(false);
  const [panelMounted, setPanelMounted] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submittingMessageId, setSubmittingMessageId] = useState<string | null>(
    null,
  );
  const [mode, setMode] = useState<ChatbotMode>("assistant");
  const [inquiryThreads, setInquiryThreads] = useState<InquiryThread[]>([]);
  const [inquiryListPage, setInquiryListPage] = useState(1);
  const [inquiryListTotal, setInquiryListTotal] = useState(0);
  const [inquiryListLoadingMore, setInquiryListLoadingMore] = useState(false);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [activeThreadEmployeeId, setActiveThreadEmployeeId] = useState<
    string | null
  >(null);
  const [inquiryMessages, setInquiryMessages] = useState<InquiryMessage[]>([]);
  const [inquiryDraft, setInquiryDraft] = useState(false);

  const INQUIRY_PAGE_SIZE = 15;
  const [followUpActions, setFollowUpActions] = useState<QuickAction[]>([]);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadingRef = useRef(false);
  const submissionKeysRef = useRef<Map<string, string>>(new Map());

  const showQuickActions = useMemo(
    () => mode === "assistant" && messages.length === 0,
    [messages.length, mode],
  );

  const activeInquiryClosed = useMemo(() => {
    if (!activeThreadId || inquiryDraft) return false;
    return (
      inquiryThreads.find((t) => t.id === activeThreadId)?.status === "closed"
    );
  }, [activeThreadId, inquiryDraft, inquiryThreads]);

  const resetAssistant = () => {
    setMessages([]);
    setConversationId(null);
    setSubmittingMessageId(null);
    setLoading(false);
    loadingRef.current = false;
    setFollowUpActions([]);
  };

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const handleOpen = (opts?: { mode?: ChatbotMode }) => {
    clearCloseTimer();
    if (opts?.mode) setMode(opts.mode);
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
    if (mode === "assistant") resetAssistant();
    else {
      setMode("assistant");
      setActiveThreadId(null);
      setActiveThreadEmployeeId(null);
      setInquiryMessages([]);
      setInquiryDraft(false);
      resetAssistant();
    }
  };

  useEffect(() => () => clearCloseTimer(), []);

  /** 문의 스레드 메시지 Realtime */
  useEffect(() => {
    if (!open || mode !== "inquiry_thread" || !activeThreadId || inquiryDraft) {
      return;
    }
    if (activeThreadId === DRAFT_THREAD_ID) return;

    try {
      return subscribeInquiryMessages(activeThreadId, (message) => {
        setInquiryMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev;
          // optimistic 임시 id 가 있으면 body 로 교체
          const withoutOptimistic = prev.filter(
            (m) =>
              !(
                m.channel === "chatbot" &&
                m.sender_id == null &&
                m.body === message.body
              ),
          );
          return [...withoutOptimistic, message];
        });
        void refreshInquiryThreads({ reset: true });
      });
    } catch (err) {
      console.warn("[inquiry realtime] messages subscribe failed", err);
      return undefined;
    }
  }, [open, mode, activeThreadId, inquiryDraft]);

  /** 문의 목록 Realtime (본인 스레드) */
  useEffect(() => {
    if (!open || (mode !== "inquiry_list" && mode !== "inquiry_thread")) {
      return;
    }
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    void getMe()
      .then((me) => {
        if (cancelled) return;
        try {
          cleanup = subscribeInquiryThreads(
            () => {
              void refreshInquiryThreads({ reset: true });
            },
            { employeeId: me.id },
          );
        } catch (err) {
          console.warn("[inquiry realtime] threads subscribe failed", err);
        }
      })
      .catch(() => {
        /* ignore */
      });
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [open, mode]);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (panelRef.current?.contains(target)) return;
      if (
        target.closest(
          ".MuiModal-root, .MuiDialog-root, [data-toast-host], .MuiAlert-root",
        )
      )
        return;
      setOpen(false);
      clearCloseTimer();
      closeTimerRef.current = setTimeout(() => {
        setPanelMounted(false);
        closeTimerRef.current = null;
      }, PANEL_ANIMATION_MS);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  const refreshInquiryThreads = async (opts?: { reset?: boolean }) => {
    const reset = opts?.reset ?? true;
    const page = reset ? 1 : inquiryListPage;
    const { data, total } = await listMyInquiryThreads({
      page: reset ? 1 : page,
      pageSize: INQUIRY_PAGE_SIZE,
    });
    if (reset) {
      setInquiryThreads(data);
      setInquiryListPage(1);
    } else {
      setInquiryThreads((prev) => {
        const seen = new Set(prev.map((t) => t.id));
        return [...prev, ...data.filter((t) => !seen.has(t.id))];
      });
    }
    setInquiryListTotal(total);
    return data;
  };

  const loadMoreInquiryThreads = async () => {
    if (inquiryListLoadingMore) return;
    if (inquiryThreads.length >= inquiryListTotal) return;
    const nextPage = inquiryListPage + 1;
    setInquiryListLoadingMore(true);
    try {
      const { data, total } = await listMyInquiryThreads({
        page: nextPage,
        pageSize: INQUIRY_PAGE_SIZE,
      });
      setInquiryListPage(nextPage);
      setInquiryListTotal(total);
      setInquiryThreads((prev) => {
        const seen = new Set(prev.map((t) => t.id));
        return [...prev, ...data.filter((t) => !seen.has(t.id))];
      });
    } catch (err) {
      toast.error(
        err instanceof ApiRequestError
          ? err.message
          : "문의 목록을 더 불러오지 못했습니다.",
      );
    } finally {
      setInquiryListLoadingMore(false);
    }
  };

  const openInquiryMode = async () => {
    setMode("inquiry_list");
    setInquiryDraft(false);
    setActiveThreadId(null);
    setActiveThreadEmployeeId(null);
    setInquiryMessages([]);
    setLoading(true);
    try {
      await refreshInquiryThreads({ reset: true });
    } catch (err) {
      toast.error(
        err instanceof ApiRequestError
          ? err.message
          : "문의 목록을 불러오지 못했습니다.",
      );
    } finally {
      setLoading(false);
    }
  };

  const openInquiryThread = async (threadId: string) => {
    setActiveThreadId(threadId);
    setMode("inquiry_thread");
    setLoading(true);
    try {
      const thread = await getInquiryThread(threadId);
      setInquiryDraft(thread?.status === "draft");
      setActiveThreadEmployeeId(thread?.employee_id ?? null);
      const msgs = await getInquiryMessages(threadId);
      setInquiryMessages(msgs);
      await markInquiryRead(threadId, "employee");
      await refreshInquiryThreads({ reset: true });
    } catch (err) {
      toast.error(
        err instanceof ApiRequestError
          ? err.message
          : "문의 대화를 불러오지 못했습니다.",
      );
    } finally {
      setLoading(false);
    }
  };

  /** draft 스레드를 DB에 만들고 채팅 UI 진입 */
  const startNewInquiry = async () => {
    setLoading(true);
    try {
      const thread = await createInquiryThread({
        subject: "관리자 문의",
        status: "draft",
      });
      setInquiryDraft(true);
      setActiveThreadId(thread.id);
      setActiveThreadEmployeeId(thread.employee_id);
      setInquiryMessages([]);
      setMode("inquiry_thread");
      await refreshInquiryThreads({ reset: true });
    } catch (err) {
      toast.error(
        err instanceof ApiRequestError
          ? err.message
          : "새 문의를 시작하지 못했습니다.",
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteInquiryThread = async (threadId: string) => {
    try {
      await deleteInquiry(threadId);
      if (activeThreadId === threadId) {
        setActiveThreadId(null);
        setActiveThreadEmployeeId(null);
        setInquiryMessages([]);
        setInquiryDraft(false);
        setMode("inquiry_list");
      }
      await refreshInquiryThreads({ reset: true });
      toast.success("문의가 삭제되었습니다.");
    } catch (err) {
      toast.error(
        err instanceof ApiRequestError
          ? err.message
          : "삭제에 실패했습니다. 종료·임시저장 문의만 삭제할 수 있어요.",
      );
    }
  };

  const sendInquiryChat = async (text: string) => {
    if (!text.trim() || loadingRef.current) return;
    if (activeInquiryClosed) {
      toast.warning("종료된 문의에는 메시지를 보낼 수 없습니다.");
      return;
    }

    loadingRef.current = true;
    setLoading(true);

    const optimisticUser: InquiryMessage = {
      id: createId(),
      thread_id: activeThreadId ?? DRAFT_THREAD_ID,
      sender_id: null,
      sender_role: "employee",
      channel: "chatbot",
      kind: "user",
      body: text.trim(),
      created_at: new Date().toISOString(),
    };
    setInquiryMessages((prev) => [...prev, optimisticUser]);

    try {
      let threadId = activeThreadId;

      if (!threadId || threadId === DRAFT_THREAD_ID) {
        const thread = await createInquiryThread({
          subject: "관리자 문의",
          status: "draft",
        });
        threadId = thread.id;
        setActiveThreadId(thread.id);
      }

      const isFirstUserMessage = inquiryDraft;
      setInquiryDraft(false);

      const sent = await sendInquiryMessage({
        threadId,
        body: text.trim(),
        channel: "chatbot",
      });

      if (isFirstUserMessage) {
        const systemBodies = buildConnectingMessages();
        const systemMsgs: InquiryMessage[] = [];
        for (const body of systemBodies) {
          systemMsgs.push(await insertInquirySystemMessage(threadId, body));
        }
        setInquiryMessages([sent, ...systemMsgs]);
      } else {
        setInquiryMessages((prev) => [
          ...prev.filter((m) => m.id !== optimisticUser.id),
          sent,
        ]);
      }
      await refreshInquiryThreads();
    } catch (err) {
      setInquiryMessages((prev) =>
        prev.filter((m) => m.id !== optimisticUser.id),
      );
      toast.error(
        err instanceof ApiRequestError
          ? err.message
          : "메시지를 보내지 못했습니다.",
      );
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  };

  const appendExchange = async (text: string) => {
    if (loadingRef.current) return;
    if (text === "__inquiry__" || text === "관리자 문의") {
      await openInquiryMode();
      return;
    }

    const userMessage: UserChatMessage = {
      id: createId(),
      role: "user",
      text,
    };

    loadingRef.current = true;
    setLoading(true);
    setFollowUpActions([]);
    setMessages((prev) => [...prev, userMessage]);

    try {
      const res = await sendAssistantMessage({
        conversation_id: conversationId,
        message: text,
      });
      const data =
        (res as { data: ChatResponseData }).data ??
        (res as unknown as ChatResponseData);

      const assistantMessage: AssistantChatMessage = {
        id: createId(),
        role: "assistant",
        response: data,
      };

      setConversationId(data.conversation_id);
      setMessages((prev) => [...prev, assistantMessage]);

      if (data.type === "blocked" || data.type === "answer") {
        setFollowUpActions([{ ...CHATBOT_UI.inquiry_action }]);
      } else {
        setFollowUpActions([]);
      }
    } catch (err) {
      const raw =
        err instanceof ApiRequestError
          ? err.message
          : "답변을 불러오지 못했어요. 다시 시도해 주세요.";
      const busy =
        /non-2xx|WORKER_RESOURCE_LIMIT|compute resources/i.test(raw);
      const msg = busy
        ? "서버가 바빠서 응답을 마치지 못했어요. 잠시 후 다시 시도해 주세요."
        : raw;
      const assistantMessage: AssistantChatMessage = {
        id: createId(),
        role: "assistant",
        response: {
          conversation_id: conversationId ?? createId(),
          type: "answer",
          message: `${msg} 필요하면 관리자 문의를 이용해 주세요.`,
          payload: {},
        },
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setFollowUpActions([{ ...CHATBOT_UI.inquiry_action }]);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  };

  const handleSend = (message: string) => {
    if (mode === "inquiry_thread") {
      void sendInquiryChat(message);
      return;
    }
    void appendExchange(message);
  };

  const handleEditLeave = async (_messageId: string) => {
    void _messageId;
    await appendExchange(
      "신청 내용을 수정하고 싶어요. 날짜와 유형을 다시 알려주세요.",
    );
  };

  const handleSubmitLeave = async (
    messageId: string,
    payload: LeavePreview,
  ) => {
    if (!payload.can_submit || !payload.confirmation_token) return;
    if (loadingRef.current) return;

    let submissionKey = submissionKeysRef.current.get(messageId);
    if (!submissionKey) {
      submissionKey = createId();
      submissionKeysRef.current.set(messageId, submissionKey);
    }

    setSubmittingMessageId(messageId);
    loadingRef.current = true;
    setLoading(true);

    try {
      const result = await submitLeaveFromToken({
        confirmation_token: payload.confirmation_token,
        submission_key: submissionKey,
      });

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
          conversation_id: conversationId ?? createId(),
          type: "answer",
          message: result.message,
          payload: {},
        },
      };
      setMessages((prev) => [...prev, resultMessage]);
    } catch (err) {
      const msg =
        err instanceof ApiRequestError
          ? err.message
          : "제출에 실패했습니다. 다시 시도해 주세요.";
      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          role: "assistant",
          response: {
            conversation_id: conversationId ?? createId(),
            type: "answer",
            message: msg,
            payload: {},
          },
        },
      ]);
    } finally {
      setSubmittingMessageId(null);
      loadingRef.current = false;
      setLoading(false);
    }
  };

  return {
    open,
    panelMounted,
    panelRef,
    messages,
    loading,
    submittingMessageId,
    showQuickActions,
    followUpActions,
    mode,
    inquiryThreads,
    inquiryListHasMore: inquiryThreads.length < inquiryListTotal,
    inquiryListLoadingMore,
    activeThreadId,
    activeThreadEmployeeId,
    inquiryMessages,
    inquiryDraft,
    activeInquiryClosed,
    ui: CHATBOT_UI,
    handleOpen,
    handleClose,
    handleEndConversation,
    handleSend,
    handleEditLeave,
    handleSubmitLeave,
    openInquiryMode,
    openInquiryThread,
    startNewInquiry,
    deleteInquiryThread,
    loadMoreInquiryThreads,
    setMode,
  };
};
