import type { GrantInput } from "../models/apis/admin";
import { ApiRequestError } from "../models/apis/common";
import type { Balance } from "../models/apis/leave";

/**
 * grant 전용 RPC가 레포에 아직 없음.
 * axios 경로만 제거하고, 연결 시 `rpc('grant_leave', …)` 등으로 교체.
 */
export const grantLeave = async (_body: GrantInput): Promise<Balance> => {
  throw new ApiRequestError({
    code: "NOT_IMPLEMENTED",
    message:
      "Leave grant RPC is not available yet. Wire when grant_leave (or equivalent) lands.",
    details: {},
  });
};
