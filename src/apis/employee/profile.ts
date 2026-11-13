import { supabase } from "../../lib/supabaseClient";
import type { EmployeeProfile } from "../../models/employee/profile";

export const getEmployeeProfile = async (): Promise<EmployeeProfile> => {
  // 1. 현재 로그인한 사용자 확인
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw authError;
  }

  if (!user) {
    throw new Error("User is not authenticated.");
  }

  // 2. 현재 로그인한 사용자의 직원 프로필 조회
  const { data, error } = await supabase
    .from("employees")
    .select("id, full_name, email, role, department, created_at")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("Employee profile not found.");
  }

  return data as EmployeeProfile;
};