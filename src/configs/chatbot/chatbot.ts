export const PANEL_ANIMATION_MS = 280;
/** @deprecated mock 전용 — 실 API는 서버 conversation_id 사용 */
export const DEFAULT_CONVERSATION_ID = "new";
export const REPLY_DELAY_MS = 0;
export const SUBMIT_DELAY_MS = 0;

export const CHATBOT_UI = {
  greeting: "안녕하세요! 무엇을 도와드릴까요?",
  quick_actions: [
    { label: "잔여 연차 확인", trigger: "잔여 연차 확인" },
    { label: "회사 휴가 규정", trigger: "회사 휴가 규정" },
  ],
  inquiry_action: { label: "관리자 문의", trigger: "__inquiry__" },
  tooltip: "연차, 편하게 물어보세요",
  header_title: "HR 도우미",
  header_subtitle: "연차와 회사 규정을 도와드려요",
  input_placeholder: "메시지를 입력해 주세요",
  input_hint: "확인 후 제출해야 신청이 접수돼요",
  inquiry_hint: "관리자에게 메시지를 보내세요",
  out_of_scope_nudge: "관리자 문의",
  inquiry_connecting: "관리자를 연결해 드리겠습니다.",
  inquiry_connected: "-관리자가 연결되었습니다-",
  inquiry_lunch_extra:
    "지금은 점심시간이라 답변이 조금 늦을 수 있어요.",
} as const;

/** Asia/Seoul 점심시간 (시, 분) */
export const LUNCH_START = { hour: 12, minute: 0 } as const;
export const LUNCH_END = { hour: 13, minute: 0 } as const;

export const isSeoulLunchTime = (date = new Date()): boolean => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  const mins = hour * 60 + minute;
  const start = LUNCH_START.hour * 60 + LUNCH_START.minute;
  const end = LUNCH_END.hour * 60 + LUNCH_END.minute;
  return mins >= start && mins < end;
};
