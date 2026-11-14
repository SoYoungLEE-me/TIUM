import { Paper } from "@mui/material";
import { forwardRef } from "react";
import type {
  ChatMessage,
  LeavePreview,
  QuickAction,
} from "../../../models/chatbot/chatbot";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import MessageList from "./MessageList";

type ChatPanelProps = {
  open: boolean;
  title: string;
  subtitle: string;
  greeting: string;
  quickActions: QuickAction[];
  showQuickActions: boolean;
  followUpActions?: QuickAction[];
  messages: ChatMessage[];
  placeholder: string;
  hint: string;
  loading: boolean;
  submittingMessageId: string | null;
  onClose: () => void;
  onEndConversation: () => void;
  onInquiry?: () => void;
  onSend: (message: string) => void;
  onQuickAction: (trigger: string) => void;
  onClarificationSelect: (label: string) => void;
  onEditLeave: (messageId: string) => void;
  onSubmitLeave: (messageId: string, payload: LeavePreview) => void;
};

const ChatPanel = forwardRef<HTMLDivElement, ChatPanelProps>(
  (
    {
      open,
      title,
      subtitle,
      greeting,
      quickActions,
      showQuickActions,
      followUpActions = [],
      messages,
      placeholder,
      hint,
      loading,
      submittingMessageId,
      onClose,
      onEndConversation,
      onInquiry,
      onSend,
      onQuickAction,
      onClarificationSelect,
      onEditLeave,
      onSubmitLeave,
    },
    ref,
  ) => {
    return (
      <Paper
        ref={ref}
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
          title={title}
          subtitle={subtitle}
          onClose={onClose}
          headerAction={messages.length === 0 ? "inquiry" : "end"}
          onHeaderAction={
            messages.length === 0
              ? onInquiry
              : onEndConversation
          }
        />
        <MessageList
          messages={messages}
          greeting={greeting}
          quickActions={quickActions}
          showQuickActions={showQuickActions}
          followUpActions={followUpActions}
          loading={loading}
          submittingMessageId={submittingMessageId}
          onQuickAction={onQuickAction}
          onClarificationSelect={onClarificationSelect}
          onEditLeave={onEditLeave}
          onSubmitLeave={onSubmitLeave}
        />
        <ChatInput
          placeholder={placeholder}
          hint={hint}
          disabled={loading || Boolean(submittingMessageId)}
          onSend={onSend}
        />
      </Paper>
    );
  },
);

ChatPanel.displayName = "ChatPanel";

export default ChatPanel;
