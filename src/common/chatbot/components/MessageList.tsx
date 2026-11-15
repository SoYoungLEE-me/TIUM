import { useEffect, useRef } from "react";
import Scroll from "../../scroll/scroll";
import type {
  AssistantChatMessage,
  ChatMessage,
  ClarificationOption,
  LeavePreview,
  QuickAction,
} from "../../../models/chatbot/chatbot";
import {
  extractIsoDates,
  parseLeaveUnitDays,
  stripLeaveUnitFromMessage,
} from "../../../utils/chatbot/chatbot";
import AssistantMessage from "./AssistantMessage";
import ChatbotLoading from "./ChatbotLoading";
import ClarificationOptions from "./ClarificationOptions";
import LeaveConfirmationCard from "./LeaveConfirmationCard";
import LeaveDateDurationOptions from "./LeaveDateDurationOptions";
import QuickActions from "./QuickActions";
import UserMessage from "./UserMessage";

type MessageListProps = {
  messages: ChatMessage[];
  greeting: string;
  quickActions: QuickAction[];
  showQuickActions: boolean;
  /** 마지막 어시스턴트 메시지 아래에 붙는 뱃지 (예: 관리자 문의) */
  followUpActions?: QuickAction[];
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
  followUpActions = [],
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
  }, [messages, showQuickActions, followUpActions, loading, submittingMessageId]);

  const lastAssistantId = [...messages]
    .reverse()
    .find((m) => m.role === "assistant")?.id;

  const latestUnitDays = (() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      const m = messages[i];
      if (m.role === "user") {
        const n = parseLeaveUnitDays(m.text);
        if (n != null) return n;
      }
      if (m.role === "assistant" && m.response.type === "clarification") {
        for (const opt of m.response.payload.options ?? []) {
          const n = parseLeaveUnitDays(opt.label);
          if (n != null) return n;
        }
      }
    }
    return 1;
  })();

  const latestStartDate = (() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      const m = messages[i];
      if (m.role !== "user") continue;
      if (/시작일/.test(m.text)) {
        const dates = extractIsoDates(m.text);
        if (dates.length > 0) return dates[0];
      }
    }
    return null;
  })();

  const renderAssistantExtras = (
    message: AssistantChatMessage,
    isLastAssistant: boolean,
  ) => {
    const { response } = message;

    if (response.type === "clarification") {
      // 과거 말풍선 버튼은 숨기고, 최신 clarification 만 선택 가능
      if (!isLastAssistant) return null;

      const missing = response.payload.missing_fields ?? [];
      const asksEnd = /종료일/.test(response.message);
      const asksDate = /날짜|시작일|종료일|기간/.test(response.message);
      const needsDate =
        asksDate ||
        missing.includes("start_date") ||
        missing.includes("end_date");
      const needsType = missing.includes("leave_type") && !asksDate;
      const disabled = loading || Boolean(submittingMessageId);

      // 종료일 질문 말풍선만 end 모드 (시작일 질문은 덮어쓰지 않음)
      const endOnly =
        asksEnd ||
        (missing.includes("end_date") && !missing.includes("start_date"));

      if (needsDate && !needsType) {
        return (
          <LeaveDateDurationOptions
            mode={endOnly ? "end" : "start"}
            startDate={latestStartDate}
            onSelect={onClarificationSelect}
            disabled={disabled}
          />
        );
      }

      const typeOptions = (
        (response.payload.options as ClarificationOption[]) ?? []
      ).filter((o) => Boolean(o.value || o.label));

      return (
        <ClarificationOptions
          options={typeOptions}
          onSelect={onClarificationSelect}
          disabled={disabled}
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

    if (
      isLastAssistant &&
      !loading &&
      followUpActions.length > 0 &&
      (response.type === "answer" || response.type === "blocked")
    ) {
      return (
        <QuickActions
          actions={followUpActions}
          onSelect={onQuickAction}
          inset={false}
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

        const isLastAssistant = message.id === lastAssistantId;
        let displayMessage = message.response.message;
        if (message.response.type === "clarification") {
          const missing = message.response.payload.missing_fields ?? [];
          const asksDate = /날짜|시작일|종료일|기간/.test(
            message.response.message,
          );
          const needsDate =
            asksDate ||
            missing.includes("start_date") ||
            missing.includes("end_date");
          if (needsDate) {
            displayMessage = stripLeaveUnitFromMessage(displayMessage);
            const unitNote = `(최소 신청 단위: ${latestUnitDays}일)`;
            if (!displayMessage.includes("최소 신청 단위")) {
              displayMessage = `${displayMessage} ${unitNote}`;
            }
          }
        }
        return (
          <AssistantMessage key={message.id} message={displayMessage}>
            {renderAssistantExtras(message, isLastAssistant)}
          </AssistantMessage>
        );
      })}
      {loading && <ChatbotLoading />}
      <div ref={bottomRef} />
    </Scroll>
  );
};

export default MessageList;
