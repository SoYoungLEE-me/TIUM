export const PASSWORD_MIN_LENGTH = 8;

export const SET_PASSWORD_DESCRIPTION = "로그인에 쓸 비밀번호를 설정해 주세요.";
export const SET_PASSWORD_HELPER = `${PASSWORD_MIN_LENGTH}자 이상 입력해 주세요.`;

export const SET_PASSWORD_ERROR = {
  empty: "비밀번호를 모두 입력해 주세요.",
  tooShort: `비밀번호는 ${PASSWORD_MIN_LENGTH}자 이상이어야 해요.`,
  mismatch: "비밀번호가 서로 달라요. 다시 확인해 주세요.",
  failed:
    "비밀번호를 설정하지 못했어요. 초대 메일의 링크로 다시 들어와 주세요.",
};

export const SET_PASSWORD_SUCCESS =
  "비밀번호를 설정했어요. 새 비밀번호로 로그인해 주세요.";

/* 계정 메뉴에서 들어오는 비밀번호 변경 */
export const CHANGE_PASSWORD_DESCRIPTION =
  "현재 비밀번호를 확인한 뒤 새 비밀번호로 바꿔요.";

export const CHANGE_PASSWORD_ERROR = {
  emptyCurrent: "현재 비밀번호를 입력해 주세요.",
  wrongCurrent: "현재 비밀번호가 맞지 않아요.",
  samePassword: "지금 쓰는 비밀번호와 다른 비밀번호를 입력해 주세요.",
  failed: "비밀번호를 바꾸지 못했어요. 잠시 후 다시 시도해 주세요.",
};

export const CHANGE_PASSWORD_SUCCESS =
  "비밀번호를 바꿨어요. 새 비밀번호로 다시 로그인해 주세요.";
