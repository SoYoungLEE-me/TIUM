import { supabase } from "../libs/supabaseClient";

/* 이메일, 비밀번호 로그인 (실패하면 Supabase 에러를 그대로 던짐) */
export const signIn = async (email: string, password: string) => {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    throw error;
  }
};

/* 로그인한 사용자 비밀번호 변경 => 초대받은 직원의 첫 비밀번호 설정에 사용 */
export const updatePassword = async (password: string) => {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    throw error;
  }
};
