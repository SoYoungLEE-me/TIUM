import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

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
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  try {
    // 1. Supabase 환경 변수 확인
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const adminKey =
      Deno.env.get("SUPABASE_SECRET_KEY") ??
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !anonKey || !adminKey) {
      console.error("Missing Supabase environment variables.");

      return jsonResponse({ error: "Server configuration error." }, 500);
    }

    // 2. 요청한 사용자의 JWT 확인
    const authHeader = req.headers.get("Authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return jsonResponse({ error: "Authentication required." }, 401);
    }

    const token = authHeader.replace("Bearer ", "");

    // HR 관리자의 JWT를 사용하는 클라이언트
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

    const {
      data: { user },
      error: authError,
    } = await callerClient.auth.getUser(token);

    if (authError || !user) {
      return jsonResponse({ error: "Invalid authentication." }, 401);
    }

    // 3. HR 관리자 권한 확인
    const { data: callerRole, error: roleError } = await callerClient.rpc(
      "get_current_user_role",
    );

    if (roleError || callerRole !== "hr_admin") {
      return jsonResponse(
        { error: "Only HR administrators can update employee profiles." },
        403,
      );
    }

    // 4. 요청 Body 검증
    let body: Record<string, unknown>;

    try {
      const parsedBody: unknown = await req.json();

      if (
        typeof parsedBody !== "object" ||
        parsedBody === null ||
        Array.isArray(parsedBody)
      ) {
        return jsonResponse({ error: "Invalid request body." }, 400);
      }

      body = parsedBody as Record<string, unknown>;
    } catch {
      return jsonResponse({ error: "Invalid JSON request body." }, 400);
    }

    const employeeId =
      typeof body.employee_id === "string" ? body.employee_id.trim() : "";

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(employeeId)) {
      return jsonResponse({ error: "A valid employee ID is required." }, 400);
    }

    // 5. 허용된 수정 필드만 추출
    const updates: {
      full_name?: string;
      department?: string | null;
    } = {};

    if ("full_name" in body) {
      if (typeof body.full_name !== "string" || !body.full_name.trim()) {
        return jsonResponse(
          { error: "Full name must be a non-empty string." },
          400,
        );
      }

      const fullName = body.full_name.trim();

      if (fullName.length > 100) {
        return jsonResponse(
          { error: "Full name must be 100 characters or fewer." },
          400,
        );
      }

      updates.full_name = fullName;
    }

    if ("department" in body) {
      if (body.department !== null && typeof body.department !== "string") {
        return jsonResponse(
          { error: "Department must be a string or null." },
          400,
        );
      }

      const department =
        typeof body.department === "string" ? body.department.trim() : null;

      if (department !== null && department.length > 100) {
        return jsonResponse(
          { error: "Department must be 100 characters or fewer." },
          400,
        );
      }

      updates.department = department || null;
    }

    if (Object.keys(updates).length === 0) {
      return jsonResponse(
        { error: "At least one profile field must be provided." },
        400,
      );
    }

    const allowedFields = ["employee_id", "full_name", "department"];

    const invalidFields = Object.keys(body).filter(
      (key) => !allowedFields.includes(key),
    );

    if (invalidFields.length > 0) {
      return jsonResponse(
        { error: "One or more fields cannot be updated." },
        400,
      );
    }

    // 6. 관리자 권한으로 직원 프로필 수정
    const adminClient = createClient(supabaseUrl, adminKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data: employee, error: updateError } = await adminClient
      .from("employees")
      .update(updates)
      .eq("id", employeeId)
      .select("id, full_name, email, role, department, created_at")
      .maybeSingle();

    if (updateError) {
      console.error("Employee profile update failed:", updateError);

      return jsonResponse(
        { error: "Unable to update the employee profile." },
        500,
      );
    }

    if (!employee) {
      return jsonResponse({ error: "Employee profile not found." }, 404);
    }

    // 7. 수정된 직원 프로필 반환
    return jsonResponse(
      {
        message: "Employee profile updated successfully.",
        employee,
      },
      200,
    );
  } catch (error) {
    console.error("Unexpected update-employee-profile error:", error);

    return jsonResponse({ error: "An unexpected server error occurred." }, 500);
  }
});
