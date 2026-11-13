
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// JSON 형식의 HTTP 응답을 생성하는 함수
function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

Deno.serve(async (req: Request) => {
  // OPTIONS 요청 처리 (CORS 사전 요청)
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // POST 요청만 허용
  if (req.method !== "POST") {
    return jsonResponse(
      { error: "Method not allowed." },
      405,
    );
  }

  try {
    // 1. Supabase 환경 변수 가져오기
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const adminKey =
      Deno.env.get("SUPABASE_SECRET_KEY") ??
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    // 필수 환경 변수가 설정되어 있는지 확인
    if (!supabaseUrl || !anonKey || !adminKey) {
      console.error("Missing Supabase environment variables.");

      return jsonResponse(
        { error: "Server configuration error." },
        500,
      );
    }

    // 2. 요청한 사용자의 JWT 추출 및 유효성 검사
    const authHeader = req.headers.get("Authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return jsonResponse(
        { error: "Authentication required." },
        401,
      );
    }

    const token = authHeader.replace("Bearer ", "");

    // 요청한 HR 사용자의 JWT를 사용하는 클라이언트 생성
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // JWT를 사용하여 현재 사용자의 인증 정보 확인
    const {
      data: { user },
      error: authError,
    } = await callerClient.auth.getUser(token);

    if (authError || !user) {
      return jsonResponse(
        { error: "Invalid authentication." },
        401,
      );
    }

    // 3. 요청한 사용자의 역할 확인
    const { data: callerRole, error: roleError } =
      await callerClient.rpc("get_current_user_role");

    // HR 관리자만 직원 생성 기능을 사용할 수 있도록 제한
    if (roleError || callerRole !== "hr_admin") {
      return jsonResponse(
        { error: "Only HR administrators can create employees." },
        403,
      );
    }

    // 4. 요청 본문 데이터 유효성 검사
    const body = await req.json();

    const fullName =
      typeof body.full_name === "string"
        ? body.full_name.trim()
        : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const department =
      typeof body.department === "string"
        ? body.department.trim()
        : null;

    // 이름과 이메일은 필수 입력 항목
    if (!fullName || !email) {
      return jsonResponse(
        { error: "Full name and email are required." },
        400,
      );
    }

    // 이름과 이메일의 최대 길이 제한 확인
    if (fullName.length > 100 || email.length > 255) {
      return jsonResponse(
        { error: "Input exceeds the maximum allowed length." },
        400,
      );
    }

    // 이메일 주소 형식 확인
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonResponse(
        { error: "Invalid email address." },
        400,
      );
    }

    // 부서명 최대 길이 확인
    if (department && department.length > 100) {
      return jsonResponse(
        { error: "Department must be 100 characters or fewer." },
        400,
      );
    }

    // 요청자가 관리자와 같은 권한을 직접 부여하지 못하도록 제한
    if (body.role !== undefined && body.role !== "employee") {
      return jsonResponse(
        { error: "Only the employee role can be assigned here." },
        400,
      );
    }

    // 5. 관리자 권한으로 Supabase 작업을 수행할 클라이언트 생성
    const adminClient = createClient(supabaseUrl, adminKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // 6. 직원 초대 이메일 발송 및 Supabase Auth 계정 생성
    const { data: inviteData, error: inviteError } =
      await adminClient.auth.admin.inviteUserByEmail(email, {
        data: {
          full_name: fullName,
        },
      });

    // 초대 이메일 발송 또는 계정 생성 실패 처리
    if (inviteError || !inviteData.user) {
      console.error("Employee invitation failed:", inviteError);

      return jsonResponse(
        { error: "Unable to invite this email address." },
        400,
      );
    }

    const newUserId = inviteData.user.id;

    // 7. employees 테이블에 직원 프로필 생성
    const { data: employee, error: insertError } =
      await adminClient
        .from("employees")
        .insert({
          id: newUserId,
          full_name: fullName,
          email,
          role: "employee",
          department: department || null,
        })
        .select("id, full_name, email, role, department, created_at")
        .single();

    // 직원 프로필 저장 실패 시 처리
    if (insertError || !employee) {
      console.error("Employee profile creation failed:", insertError);

      // 프로필 생성에 실패하면 Supabase Auth에 생성된 계정 삭제
      const { error: deleteError } =
        await adminClient.auth.admin.deleteUser(newUserId);

      if (deleteError) {
        console.error("Auth user rollback failed:", deleteError);
      }

      return jsonResponse(
        { error: "Unable to create the employee profile." },
        500,
      );
    }

    // 8. 생성된 직원 정보 반환
    return jsonResponse(
      {
        message: "Employee invitation sent successfully.",
        employee,
      },
      201,
    );
  } catch (error) {
    // 예상하지 못한 서버 오류 처리
    console.error("Unexpected create-employee error:", error);

    return jsonResponse(
      { error: "An unexpected server error occurred." },
      500,
    );
  }
});
