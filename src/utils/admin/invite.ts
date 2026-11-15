import { INVITE_ERROR } from "../../configs/admin/invite";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (email: string) => EMAIL_PATTERN.test(email);

/* create-employee Edge Function 응답 상태 코드 => 안내 문구 */
export const toInviteErrorMessage = (error: unknown) => {
  const cause = error instanceof Error ? error.cause : undefined;
  const status =
    cause && typeof cause === "object" && "context" in cause
      ? (cause.context as Response | undefined)?.status
      : undefined;

  if (status === 409) return INVITE_ERROR.duplicate;
  if (status === 400) return INVITE_ERROR.email;
  if (status === 401 || status === 403) return INVITE_ERROR.forbidden;
  return INVITE_ERROR.failed;
};
