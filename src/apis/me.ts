import { supabase } from "../libs/supabaseClient";
import { ApiRequestError } from "../models/apis/common";
import type { Employee } from "../models/apis/employees";
import { unwrap } from "./apiRequest";

export const getMe = async (): Promise<Employee> => {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw new ApiRequestError(
      {
        code: "UNAUTHENTICATED",
        message: authError.message || "로그인이 필요합니다.",
        details: {},
      },
      { cause: authError }
    );
  }

  if (!user) {
    throw new ApiRequestError({
      code: "UNAUTHENTICATED",
      message: "User is not authenticated.",
      details: {},
    });
  }

  const data = await unwrap(
    supabase
      .from("employees")
      .select("id, full_name, email, role, department, created_at")
      .eq("id", user.id)
      .maybeSingle()
  );

  if (!data) {
    throw new ApiRequestError({
      code: "NOT_FOUND",
      message: "Employee profile not found.",
      details: {},
    });
  }

  return data as Employee;
};
