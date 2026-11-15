import { DEFAULT_CONVERSATION_ID } from "../../configs/chatbot/chatbot";
import type {
  ChatResponseData,
  ChatbotMock,
  LeaveConfirmationData,
  ReasonCode,
} from "../../models/chatbot/chatbot";

/** 연속 한도 초과 등 제출 불가 leave_confirmation → blocked 로 정규화 */
export const normalizeLeaveChatResponse = (
  data: ChatResponseData,
): ChatResponseData => {
  if (data.type !== "leave_confirmation") return data;

  const conf = data as LeaveConfirmationData;
  const reasons = (conf.payload.review_reasons ?? []) as ReasonCode[];
  const exceeds = reasons.includes("EXCEEDS_MAX_CONSECUTIVE_DAYS");

  if (conf.payload.can_submit && !exceeds) return data;

  const days = conf.payload.total_days;
  const message = exceeds
    ? `요청하신 기간(총 ${days}일)은 회사의 최대 연속 신청 일수를 초과해 신청할 수 없어요. 기간을 줄여서 다시 알려 주세요.`
    : conf.message;

  return {
    conversation_id: conf.conversation_id,
    type: "blocked",
    message,
    payload: {
      reason_codes: exceeds
        ? ["EXCEEDS_MAX_CONSECUTIVE_DAYS"]
        : reasons.length > 0
          ? reasons
          : (["INVALID_DATE_RANGE"] as ReasonCode[]),
      requested_days: days,
      available_days: conf.payload.balance?.available_days,
    },
  };
};

export const createId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

/** Asia/Seoul 기준 오늘에서 days일 후 (YYYY-MM-DD) */
export const seoulDatePlusDays = (days: number, from = new Date()): string => {
  const today = from.toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
  const [y, m, d] = today.split("-").map(Number);
  const utc = Date.UTC(y, m - 1, d + days);
  return new Date(utc).toISOString().slice(0, 10);
};

/** clarification 라벨: 차감/단위 → 최소 신청 단위 */
export const formatLeaveOptionLabel = (label: string): string =>
  label
    .replace(/(\d+(?:\.\d+)?일)\s*차감/g, "$1 단위")
    .replace(
      /\((\d+(?:\.\d+)?)일\s*단위\)/g,
      "(최소 신청 단위: $1일)",
    );

/** "연차 (최소 신청 단위: 1일)" / "1일 단위" 등에서 단위 일수 추출 */
export const parseLeaveUnitDays = (text: string): number | null => {
  const m =
    text.match(/최소\s*신청\s*단위:\s*(\d+(?:\.\d+)?)\s*일/) ??
    text.match(/(\d+(?:\.\d+)?)\s*일\s*단위/);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) && n > 0 ? n : null;
};

/** 메시지에서 YYYY-MM-DD 추출 */
export const extractIsoDates = (text: string): string[] =>
  [...text.matchAll(/\d{4}-\d{2}-\d{2}/g)].map((m) => m[0]);

/** 날짜 안내 문구에서 "(1일 단위)" 등 유형 단위 표기 제거 */
export const stripLeaveUnitFromMessage = (message: string): string =>
  message
    .replace(/\s*\(\d+(?:\.\d+)?일\s*단위\)/g, "")
    .replace(/\s*\(최소\s*신청\s*단위:\s*\d+(?:\.\d+)?일\)/g, "")
    .replace(/\s*\(신청\s*단위:\s*\d+(?:\.\d+)?일\)/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();

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
  if (trimmed.includes("신청")) {
    return mock.scenarios["반차 신청"].data;
  }

  return {
    conversation_id: DEFAULT_CONVERSATION_ID,
    type: "answer",
    message:
      "연차 조회·규정 안내·휴가 신청을 도와드릴 수 있어요. 예: “잔여 연차 확인”, “연차 신청해 줘”",
    payload: {},
  };
};
