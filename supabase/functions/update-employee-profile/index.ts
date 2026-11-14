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
      email?: string;
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

    if ("email" in body) {
      if (typeof body.email !== "string" || !body.email.trim()) {
        return jsonResponse(
          { error: "Email must be a non-empty string." },
          400,
        );
      }

      const email = body.email.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(email)) {
        return jsonResponse({ error: "A valid email is required." }, 400);
      }

      if (email.length > 255) {
        return jsonResponse(
          { error: "Email must be 255 characters or fewer." },
          400,
        );
      }

      updates.email = email;
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

    const allowedFields = [
      "employee_id",
      "full_name",
      "email",
      "department",
    ];

    const invalidFields = Object.keys(body).filter(
      (key) => !allowedFields.includes(key),
    );

    if (invalidFields.length > 0) {
      return jsonResponse(
        { error: "One or more fields cannot be updated." },
        400,
      );
    }

    if (Object.keys(updates).length === 0) {
      return jsonResponse(
        { error: "At least one profile field must be provided." },
        400,
      );
    }

    // 6. 관리자 권한으로 직원 정보 조회
    const adminClient = createClient(supabaseUrl, adminKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data: existingEmployee, error: employeeError } =
      await adminClient
        .from("employees")
        .select("id, email")
        .eq("id", employeeId)
        .maybeSingle();

    if (employeeError) {
      console.error("Employee lookup failed:", employeeError);
      return jsonResponse(
        { error: "Unable to retrieve the employee profile." },
        500,
      );
    }

    if (!existingEmployee) {
      return jsonResponse({ error: "Employee profile not found." }, 404);
    }

    // 7. 이메일 중복 확인
    const emailChanged =
      updates.email !== undefined &&
      updates.email !== existingEmployee.email;

    if (emailChanged) {
      const { data: duplicateEmployee, error: duplicateError } =
        await adminClient
          .from("employees")
          .select("id")
          .ilike("email", updates.email!.replace(/[\\%_]/g, "\\$&"))
          .neq("id", employeeId)
          .maybeSingle();

      if (duplicateError) {
        console.error("Email duplicate check failed:", duplicateError);
        return jsonResponse(
          { error: "Unable to validate the email address." },
          500,
        );
      }

      if (duplicateEmployee) {
        return jsonResponse(
          { error: "This email address is already in use." },
          409,
        );
      }
    }

    // 8. Supabase Auth 이메일 변경
    if (emailChanged) {
      const { error: authUpdateError } =
        await adminClient.auth.admin.updateUserById(employeeId, {
          email: updates.email!,
          email_confirm: true,
        });

      if (authUpdateError) {
        console.error("Auth email update failed:", authUpdateError);
        return jsonResponse(
          { error: "Unable to update the employee authentication email." },
          500,
        );
      }
    }

    // 9. 직원 프로필 수정
    const { data: employee, error: updateError } = await adminClient
      .from("employees")
      .update(updates)
      .eq("id", employeeId)
      .select("id, full_name, email, role, department, created_at")
      .maybeSingle();

    if (updateError || !employee) {
      console.error("Employee profile update failed:", updateError);

      // DB 변경 실패 시 Auth 이메일 복구
      if (emailChanged) {
        const { error: rollbackError } =
          await adminClient.auth.admin.updateUserById(employeeId, {
            email: existingEmployee.email,
            email_confirm: true,
          });

        if (rollbackError) {
          console.error("Auth email rollback failed:", rollbackError);
        }
      }

      if (!updateError && !employee) {
        return jsonResponse({ error: "Employee profile not found." }, 404);
      }

      return jsonResponse(
        { error: "Unable to update the employee profile." },
        500,
      );
    }

    // 10. 수정된 직원 프로필 반환
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
