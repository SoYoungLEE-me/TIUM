import { DEFAULT_CONVERSATION_ID } from "../../configs/chatbot/chatbot";
import type {
  ChatResponseData,
  ChatbotMock,
} from "../../models/chatbot/chatbot";

export const createId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const wait = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const findScenario = (
  input: string,
  mock: ChatbotMock,
): ChatResponseData | null => {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const exact = mock.scenarios[trimmed];
  if (exact) return exact.data;

  const entries = Object.entries(mock.scenarios);
  const partial = entries.find(
    ([key]) => trimmed.includes(key) || key.includes(trimmed),
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
    conversation_id: DEFAULT_CONVERSATION_ID,
    type: "answer",
    message:
      "연차 조회·규정 안내·휴가 신청을 도와드릴 수 있어요. 예: “잔여 연차 확인”, “금요일 오전 반차 신청해 줘”",
    payload: {},
  };
};
