import { useChatbot } from "../../hooks/chatbot/useChatbot";
import ChatPanel from "./components/ChatPanel";
import FloatingButton from "./components/FloatingButton";

const Chatbot = () => {
  const {
    open,
    panelMounted,
    panelRef,
    messages,
    loading,
    submittingMessageId,
    showQuickActions,
    ui,
    handleOpen,
    handleClose,
    handleEndConversation,
    handleSend,
    handleEditLeave,
    handleSubmitLeave,
  } = useChatbot();

  return (
    <>
      <FloatingButton visible={!panelMounted} onOpen={handleOpen} />
      {panelMounted && (
        <ChatPanel
          ref={panelRef}
          open={open}
          title={ui.header_title}
          subtitle={ui.header_subtitle}
          greeting={ui.greeting}
          quickActions={ui.quick_actions}
          showQuickActions={showQuickActions}
          messages={messages}
          placeholder={ui.input_placeholder}
          hint={ui.input_hint}
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
