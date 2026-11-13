import type { GrantInput } from "../models/apis/admin";
import { ApiRequestError } from "../models/apis/common";
import type { Balance } from "../models/apis/leave";

/**
 * grant 전용 RPC가 레포에 아직 없음.
 */
export const grantLeave = async (body: GrantInput): Promise<Balance> => {
  void body;

  throw new ApiRequestError({
    code: "NOT_IMPLEMENTED",
    message:
      "Leave grant RPC is not available yet. Wire when grant_leave (or equivalent) lands.",
    details: {},
  });
};
