export const INVITE_DIALOG_TITLE = "직원 초대";
export const INVITE_DIALOG_DESCRIPTION =
  "입력한 이메일로 초대 메일을 보냅니다. 직원은 메일 링크에서 비밀번호를 설정한 뒤 로그인합니다.";
export const INVITE_NOTICE =
  "직원 권한으로 등록됩니다. 초대 후 「연차 부여」로 올해 연차를 넣어 주세요.";
export const INVITE_DEPARTMENT_PLACEHOLDER = "목록에서 고르거나 새로 입력";

export const INVITE_SUCCESS = (name: string) =>
  `${name}님에게 초대 메일을 보냈어요.`;

export const INVITE_ERROR = {
  required: "이름과 이메일을 입력해 주세요.",
  email: "이메일 형식을 확인해 주세요.",
  duplicate: "이미 등록된 이메일이에요.",
  forbidden: "직원을 초대할 권한이 없어요.",
  failed: "초대 메일을 보내지 못했어요. 잠시 후 다시 시도해 주세요.",
};
