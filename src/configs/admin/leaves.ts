export const ADMIN_LEAVES_MAX_WIDTH = 1280;

export const ADMIN_LEAVES_TITLE = "직원 연차";
export const ADMIN_LEAVES_DESCRIPTION =
  "직원별 연차 현황을 확인하고 부여·사용·대기 일수를 관리합니다.";

export const DEFAULT_LEAVE_YEAR = 2026;

export const GRANT_DAY_STEP = 1;
export const GRANT_DAY_MIN = 1;
export const GRANT_DAY_MAX = 30;

export const LEAVES_TABLE_UNIT_NOTE = "단위: 일 · 1일 단위로 관리합니다.";

export const LEAVES_PENDING_INFO =
  "검토 대기 연차는 아직 차감되지 않습니다. 잔여 연차는 유지되며, 신청 가능 연차에서만 제외됩니다. 승인되면 사용 연차로 전환됩니다.";

export const LEAVES_CONCEPT_CARDS = [
  {
    id: "remaining",
    title: "잔여 연차",
    description:
      "총 부여 − 사용으로 계산됩니다. 승인된 미래 연차도 사용에 포함됩니다.",
  },
  {
    id: "pending",
    title: "검토 대기 연차",
    description:
      "HR 검토 중인 신청 일수의 합계입니다. 아직 실제 차감은 없습니다.",
  },
  {
    id: "available",
    title: "신청 가능 연차",
    description:
      "잔여 − 검토 대기로 계산됩니다. 새 신청 시 실제로 쓸 수 있는 일수입니다.",
  },
];

export const LEAVE_HISTORY_EMPTY =
  "기존 예시 잔액만 등록되어 있습니다. 부여·조정 이력이 쌓이면 여기에 표시됩니다.";

export const GRANT_DIALOG_TITLE = "직원 연차 부여";
export const GRANT_DIALOG_DESCRIPTION =
  "부여한 일수는 기존 총 연차에 더해집니다.";
export const GRANT_REASON_PLACEHOLDER = "예: 초기 연차 부여, 특별 연차 부여";

export const LEAVES_PAGE_SIZE = 8;

/** 반응형(스택)일 때 상세 패널 앵커 */
export const ADMIN_LEAVES_DETAIL_ANCHOR_ID = "admin-leaves-detail";
