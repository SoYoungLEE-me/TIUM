export const LANDING_SLOGAN = "여유와 성장이 틔어나는 일터";

export const LANDING_HERO = {
  title: ["연차 신청,", "말하면 끝나요."],
  description: [
    "신청서 칸을 채울 필요 없어요.",
    "AI가 잔여 연차와 회사 규정을 확인해서",
    "바로 처리해 드려요.",
  ],
};

/* 히어로 아래 예시 */
export const LANDING_DEMO = {
  request: "다음 주 금요일 연차 쓸게요",
  days: [
    { date: 16, day: "월" },
    { date: 17, day: "화" },
    { date: 18, day: "수", half: "오후 반차" },
    { date: 19, day: "목" },
    { date: 20, day: "금", leave: true },
    { date: 21, day: "토", weekend: true },
    { date: 22, day: "일", weekend: true },
  ],
  result: "연차 승인됨",
  resultDetail: "잔여 8.5일에서 7.5일로",
};

/** tone — 말풍선 색 (annual 연차, half 반차, rule 규정) */
export type LandingExampleTone = "annual" | "half" | "rule";

export const LANDING_EXAMPLES: {
  ask: string;
  answer: string;
  tone: LandingExampleTone;
}[] = [
  {
    ask: "남은 연차 며칠이야?",
    answer:
      "8.5일 남았어요. 승인을 기다리는 3일까지 빼면 지금 바로 쓸 수 있는 건 5.5일이에요.",
    tone: "annual",
  },
  {
    ask: "18일 오후 반차 쓸게",
    answer:
      "11월 18일 오후 반차로 0.5일 신청했어요. 규정에 맞아서 바로 승인됐어요.",
    tone: "half",
  },
  {
    ask: "연차 하루 전에 내도 돼?",
    answer:
      "우리 회사는 사용일 1일 전까지 신청하면 돼요. 3일 이상 연속이면 팀장 승인이 필요해요.",
    tone: "rule",
  },
];

export const LANDING_CTA = {
  title: "다음 연차는 한 문장으로 내 보세요",
  description: "회사 이메일로 로그인하면 바로 쓸 수 있어요.",
};
