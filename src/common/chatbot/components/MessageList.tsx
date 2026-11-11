import { useEffect, useRef } from "react";
import Scroll from "../../scroll/scroll";
import type {
  AssistantChatMessage,
  ChatMessage,
  ClarificationOption,
  LeavePreview,
  QuickAction,
} from "../types";
import AssistantMessage from "./AssistantMessage";
import ChatbotLoading from "./ChatbotLoading";
import ClarificationOptions from "./ClarificationOptions";
import LeaveConfirmationCard from "./LeaveConfirmationCard";
import QuickActions from "./QuickActions";
import UserMessage from "./UserMessage";

type MessageListProps = {
  messages: ChatMessage[];
  greeting: string;
  quickActions: QuickAction[];
  showQuickActions: boolean;
  loading: boolean;
  submittingMessageId: string | null;
  onQuickAction: (trigger: string) => void;
  onClarificationSelect: (label: string) => void;
  onEditLeave: (messageId: string) => void;
  onSubmitLeave: (messageId: string, payload: LeavePreview) => void;
};

const MessageList = ({
  messages,
  greeting,
  quickActions,
  showQuickActions,
  loading,
  submittingMessageId,
  onQuickAction,
  onClarificationSelect,
  onEditLeave,
  onSubmitLeave,
}: MessageListProps) => {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, showQuickActions, loading, submittingMessageId]);

  const renderAssistantExtras = (message: AssistantChatMessage) => {
    const { response } = message;

    if (response.type === "clarification") {
      return (
        <ClarificationOptions
          options={response.payload.options as ClarificationOption[]}
          onSelect={onClarificationSelect}
          disabled={loading || Boolean(submittingMessageId)}
        />
      );
    }

    if (response.type === "leave_confirmation") {
      return (
        <LeaveConfirmationCard
          payload={response.payload}
          submitted={message.submitted}
          submitResult={message.submitResult}
          submitting={submittingMessageId === message.id}
          disabled={loading}
          onEdit={() => onEditLeave(message.id)}
          onSubmit={() => onSubmitLeave(message.id, response.payload)}
        />
      );
    }

    return null;
  };

  return (
    <Scroll
      sx={{
        px: 2,
        py: 2,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        bgcolor: "background.default",
      }}
    >
      <AssistantMessage message={greeting} />
      {showQuickActions && !loading && (
        <QuickActions actions={quickActions} onSelect={onQuickAction} />
      )}

      {messages.map((message) => {
        if (message.role === "user") {
          return <UserMessage key={message.id} text={message.text} />;
        }

        return (
          <AssistantMessage key={message.id} message={message.response.message}>
            {renderAssistantExtras(message)}
          </AssistantMessage>
        );
      })}
      {loading && <ChatbotLoading />}
      <div ref={bottomRef} />
    </Scroll>
  );
};

export default MessageList;
