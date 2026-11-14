import {
  useCallback,
  useEffect,
  useState,
  type UIEvent,
} from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import { useChatbot } from "../../hooks/chatbot/useChatbot";
import type { InquiryThread } from "../../apis/inquiries";
import { ConfirmModal } from "../components/modal";
import ChatPanel from "./components/ChatPanel";
import FloatingButton from "./components/FloatingButton";
import UserMessage from "./components/UserMessage";
import AssistantMessage from "./components/AssistantMessage";
import ChatHeader from "./components/ChatHeader";
import ChatInput from "./components/ChatInput";
import ChatbotLoading from "./components/ChatbotLoading";
import Scroll from "../scroll/scroll";

const displayInquiryStatus = (
  thread: InquiryThread,
): "closed" | "draft" | "open" => {
  if (thread.status === "closed") return "closed";
  // 사용자 채팅이 한 번도 없으면 임시 저장
  if (thread.status === "draft" || !thread.has_user_message) return "draft";
  return "open";
};

const inquiryStatusLabel = (status: "closed" | "draft" | "open") => {
  if (status === "closed") return "대화종료";
  if (status === "draft") return "임시 저장";
  return "대화중";
};

const inquiryStatusColor = (
  status: "closed" | "draft" | "open",
): "default" | "primary" | "warning" => {
  if (status === "closed") return "default";
  if (status === "draft") return "warning";
  return "primary";
};

const canDeleteInquiry = (thread: InquiryThread) => {
  const status = displayInquiryStatus(thread);
  return status === "closed" || status === "draft";
};

const Chatbot = () => {
  const {
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
    inquiryListHasMore,
    inquiryListLoadingMore,
    inquiryMessages,
    inquiryDraft,
    activeInquiryClosed,
    ui,
    handleOpen,
    handleClose,
    handleEndConversation,
    handleSend,
    handleEditLeave,
    handleSubmitLeave,
    openInquiryThread,
    openInquiryMode,
    startNewInquiry,
    deleteInquiryThread,
    loadMoreInquiryThreads,
    setMode,
  } = useChatbot();

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  useEffect(() => {
    const onOpenInquiry = (event: Event) => {
      const detail = (
        event as CustomEvent<{ threadId?: string; startNew?: boolean }>
      ).detail;
      handleOpen({ mode: "inquiry_list" });
      if (detail?.startNew) {
        void startNewInquiry();
      } else if (detail?.threadId) {
        void openInquiryThread(detail.threadId);
      } else {
        void openInquiryMode();
      }
    };
    window.addEventListener("open-chatbot-inquiry", onOpenInquiry);
    return () =>
      window.removeEventListener("open-chatbot-inquiry", onOpenInquiry);
  }, [handleOpen, openInquiryMode, openInquiryThread, startNewInquiry]);

  const inquiryUnread = inquiryThreads.reduce(
    (sum, t) => sum + (t.unread_employee ?? 0),
    0,
  );

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    const id = deleteTargetId;
    setDeleteTargetId(null);
    await deleteInquiryThread(id);
  };

  const connectingBlockEndIndex = (() => {
    const start = inquiryMessages.findIndex(
      (m) =>
        m.kind === "system" && m.body === ui.inquiry_connecting,
    );
    if (start < 0) return -1;
    let end = start;
    while (
      end + 1 < inquiryMessages.length &&
      inquiryMessages[end + 1].kind === "system"
    ) {
      end += 1;
    }
    return end;
  })();

  /** 챗봇 채팅방: chatbot 채널만 사용자 말풍선 */
  const isChatbotSide = (m: (typeof inquiryMessages)[number]) =>
    m.kind === "user" && m.channel === "chatbot";

  /** 문의함(admin 채널) 답변이 있으면 관리자 연결됨 */
  const hasAssignedAdmin = inquiryMessages.some(
    (m) => m.kind === "user" && m.channel === "admin",
  );

  /** 연결 안내 직후·관리자 미연결: 로딩 */
  const showInquiryConnecting =
    connectingBlockEndIndex >= 0 && !hasAssignedAdmin && !activeInquiryClosed;

  /** 관리자 연결(첫 답변) 후: 중앙 안내 */
  const showInquiryConnected =
    connectingBlockEndIndex >= 0 && hasAssignedAdmin;

  const onInquiryListScroll = useCallback(
    (e: UIEvent<HTMLDivElement>) => {
      const el = e.currentTarget;
      if (!inquiryListHasMore || inquiryListLoadingMore) return;
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 48) {
        void loadMoreInquiryThreads();
      }
    },
    [inquiryListHasMore, inquiryListLoadingMore, loadMoreInquiryThreads],
  );

  if (!panelMounted) {
    return (
      <FloatingButton
        visible
        badge={inquiryUnread}
        onOpen={() => handleOpen()}
      />
    );
  }

  if (mode === "inquiry_list" || mode === "inquiry_thread") {
    return (
      <>
        <FloatingButton visible={false} onOpen={() => handleOpen()} />
        <Paper
          ref={panelRef}
          elevation={0}
          sx={{
            position: "fixed",
            right: { xs: 16, sm: 24 },
            bottom: { xs: 16, sm: 24 },
            zIndex: (theme) => theme.zIndex.modal,
            width: { xs: "calc(100vw - 32px)", sm: 380 },
            maxWidth: 380,
            height: "min(640px, calc(100dvh - 48px))",
            maxHeight: "calc(100dvh - 48px)",
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            borderRadius: 3,
            boxShadow: "0 16px 48px rgba(33, 27, 34, 0.18)",
            transformOrigin: "bottom right",
            opacity: open ? 1 : 0,
            transform: open
              ? "scale(1) translate3d(0, 0, 0)"
              : "scale(0.18) translate3d(12px, 20px, 0)",
            transition:
              "opacity 280ms cubic-bezier(0.22, 1, 0.36, 1), transform 280ms cubic-bezier(0.22, 1, 0.36, 1)",
            pointerEvents: open ? "auto" : "none",
          }}
        >
          <ChatHeader
            title={mode === "inquiry_list" ? "관리자 문의" : "문의 대화"}
            subtitle={
              mode === "inquiry_list"
                ? "목록에서 스레드를 선택하세요"
                : inquiryDraft
                  ? "첫 메시지를 보내면 문의가 접수돼요"
                  : activeInquiryClosed
                    ? "종료된 문의입니다"
                    : "HR과 메시지를 주고받아요"
            }
            onClose={handleClose}
            headerAction={mode === "inquiry_thread" ? "list" : undefined}
            onHeaderAction={
              mode === "inquiry_thread"
                ? () => void openInquiryMode()
                : undefined
            }
          />
          {mode === "inquiry_list" ? (
            <>
              <Scroll
                sx={{ flex: 1, px: 1, py: 1 }}
                onScroll={onInquiryListScroll}
              >
                {inquiryThreads.length === 0 ? (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ px: 2, py: 2 }}
                  >
                    아직 문의가 없습니다.
                  </Typography>
                ) : (
                  <List dense>
                    {inquiryThreads.map((thread) => (
                      <ListItemButton
                        key={thread.id}
                        onClick={() => void openInquiryThread(thread.id)}
                        sx={{ alignItems: "flex-start", gap: 0.5 }}
                      >
                        <ListItemText
                          slotProps={{ primary: { component: "div" } }}
                          primary={
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                pr: 0.5,
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 600,
                                  flex: 1,
                                  minWidth: 0,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {thread.subject}
                              </Typography>
                              <Chip
                                size="small"
                                label={inquiryStatusLabel(
                                  displayInquiryStatus(thread),
                                )}
                                color={inquiryStatusColor(
                                  displayInquiryStatus(thread),
                                )}
                                sx={{ height: 22, fontSize: 11, flexShrink: 0 }}
                              />
                            </Box>
                          }
                          secondary={new Date(
                            thread.last_message_at,
                          ).toLocaleString("ko-KR")}
                        />
                        {thread.unread_employee > 0 ? (
                          <Box
                            sx={{
                              minWidth: 20,
                              height: 20,
                              borderRadius: 999,
                              bgcolor: "error.main",
                              color: "#fff",
                              fontSize: 11,
                              fontWeight: 700,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              mt: 0.5,
                            }}
                          >
                            {thread.unread_employee}
                          </Box>
                        ) : null}
                        {canDeleteInquiry(thread) ? (
                          <IconButton
                            size="small"
                            aria-label="문의 삭제"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteTargetId(thread.id);
                            }}
                            sx={{ mt: 0.25 }}
                          >
                            <DeleteOutlineRoundedIcon fontSize="small" />
                          </IconButton>
                        ) : null}
                      </ListItemButton>
                    ))}
                  </List>
                )}
                {inquiryListLoadingMore ? (
                  <Box sx={{ display: "flex", justifyContent: "center", py: 1 }}>
                    <CircularProgress size={20} />
                  </Box>
                ) : null}
              </Scroll>
              <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
                <Button
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  onClick={() => void startNewInquiry()}
                >
                  새 문의 시작
                </Button>
                <Button
                  fullWidth
                  sx={{ mt: 1 }}
                  onClick={() => setMode("assistant")}
                >
                  HR 도우미로 돌아가기
                </Button>
              </Box>
            </>
          ) : (
            <>
              <Scroll
                sx={{
                  flex: 1,
                  px: 2,
                  py: 2,
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  bgcolor: "background.default",
                }}
              >
                {inquiryMessages.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    문의 내용을 입력해 주세요.
                  </Typography>
                ) : null}
                {inquiryMessages.map((m, index) => (
                  <Box key={m.id} sx={{ display: "contents" }}>
                    {isChatbotSide(m) ? (
                      <UserMessage text={m.body} />
                    ) : (
                      <AssistantMessage message={m.body} />
                    )}
                    {index === connectingBlockEndIndex ? (
                      showInquiryConnecting ? (
                        <ChatbotLoading />
                      ) : showInquiryConnected ? (
                        <Typography
                          component="p"
                          sx={{
                            m: 0,
                            width: "100%",
                            textAlign: "center",
                            fontSize: 12,
                            lineHeight: 1.5,
                            color: "text.secondary",
                            py: 0.5,
                          }}
                        >
                          {ui.inquiry_connected}
                        </Typography>
                      ) : null
                    ) : null}
                  </Box>
                ))}
              </Scroll>
              <ChatInput
                placeholder={
                  activeInquiryClosed
                    ? "종료된 문의입니다"
                    : "메시지를 입력해 주세요"
                }
                hint={
                  activeInquiryClosed
                    ? "이 문의는 더 이상 이어갈 수 없어요"
                    : ui.inquiry_hint
                }
                disabled={loading || activeInquiryClosed}
                onSend={handleSend}
              />
            </>
          )}
          <ConfirmModal
            open={Boolean(deleteTargetId)}
            title="대화 삭제"
            message="대화를 삭제하시겠습니까?"
            confirmLabel="예"
            cancelLabel="아니오"
            confirmColor="error"
            onCancel={() => setDeleteTargetId(null)}
            onConfirm={() => void handleConfirmDelete()}
          />
        </Paper>
      </>
    );
  }

  return (
    <>
      <FloatingButton
        visible={false}
        badge={inquiryUnread}
        onOpen={() => handleOpen()}
      />
      <ChatPanel
        ref={panelRef}
        open={open}
        title={ui.header_title}
        subtitle={ui.header_subtitle}
        greeting={ui.greeting}
        quickActions={[...ui.quick_actions]}
        showQuickActions={showQuickActions}
        followUpActions={followUpActions}
        messages={messages}
        placeholder={ui.input_placeholder}
        hint={ui.input_hint}
        loading={loading}
        submittingMessageId={submittingMessageId}
        onClose={handleClose}
        onEndConversation={handleEndConversation}
        onInquiry={() => void openInquiryMode()}
        onSend={handleSend}
        onQuickAction={handleSend}
        onClarificationSelect={handleSend}
        onEditLeave={(messageId) => {
          void handleEditLeave(messageId);
        }}
        onSubmitLeave={handleSubmitLeave}
      />
    </>
  );
};

export default Chatbot;
