import type { PostgrestError } from "@supabase/supabase-js";
import { supabase } from "../libs/supabaseClient";
import { ApiRequestError } from "../models/apis/common";

type DataErrorResult<T> = {
  data: T;
  error: PostgrestError | null;
};

const toApiError = (
  error: { message: string; code?: string; details?: string; hint?: string },
  options?: { status?: number; cause?: unknown; code?: string }
) =>
  new ApiRequestError(
    {
      code: options?.code ?? error.code ?? "SUPABASE_ERROR",
      message: error.message || "요청에 실패했습니다.",
      details: {
        ...(error.details ? { details: error.details } : {}),
        ...(error.hint ? { hint: error.hint } : {}),
      },
    },
    { status: options?.status, cause: options?.cause ?? error }
  );

/** Postgrest `{ data, error }` 결과를 통일 처리 */
export const unwrap = async <T>(
  result: DataErrorResult<T> | PromiseLike<DataErrorResult<T>>
): Promise<T> => {
  const { data, error } = await result;
  if (error) {
    throw toApiError(error);
  }
  return data;
};

/** `supabase.rpc` 래퍼 */
export const rpc = async <T>(
  fn: string,
  args?: Record<string, unknown>
): Promise<T> => {
  const { data, error } = await supabase.rpc(
    fn as never,
    (args ?? {}) as never
  );
  if (error) {
    throw toApiError(error);
  }
  return data as T;
};

/** Edge Function `functions.invoke` 래퍼 */
export const invokeFunction = async <T>(
  name: string,
  body?: Record<string, unknown>
): Promise<T> => {
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) {
    throw toApiError(
      { message: error.message, code: "FUNCTION_ERROR" },
      { cause: error, code: "FUNCTION_ERROR" }
    );
  }
  return data as T;
};
