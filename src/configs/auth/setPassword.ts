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

export const SET_PASSWORD_SUCCESS = "비밀번호가 설정됐어요. 환영해요!";
