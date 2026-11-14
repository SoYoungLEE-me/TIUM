/**
 * HR assistant Edge Function (Gemini + DB tools).
 * Secrets: GEMINI_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY
 */
import {
  createClient,
  type SupabaseClient,
} from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `당신은 HR 연차·규정 도우미입니다. 친근한 한국어 존댓말을 쓰고 결론부터 말합니다.
숫자는 반드시 도구 결과만 사용하세요. 추측하지 마세요.
휴가 유형은 leave_types의 id/name/deduction_days만 사용합니다(code 없음).
신청은 prepare_leave_request로만 준비하고, 저장은 하지 마세요.
범위 밖(급여·타인정보·승인대행 등)이면 "제가 처리할 수 없거나 진행할 수 없는 사안이에요. 관리자 문의로 남겨 주세요."라고 안내하세요.
최종 답변은 반드시 아래 JSON 하나만 출력하세요(다른 텍스트 금지):
{"type":"answer"|"clarification"|"leave_confirmation"|"blocked","message":"...","payload":{...}}
clarification options의 value는 leave_type_id(uuid)를 쓰세요.
leave_confirmation payload는 prepare_leave_request 결과를 그대로 넣으세요.
blocked는 reason_codes 배열을 포함하세요.`;

const TOOL_DECLARATIONS = [
  {
    name: "get_my_leave_balance",
    description: "본인 연차 잔여 조회",
    parameters: {
      type: "object",
      properties: { year: { type: "integer" } },
    },
  },
  {
    name: "get_leave_policy",
    description: "휴가 유형·회사설정·승인규칙 조회",
    parameters: { type: "object", properties: {} },
  },
  {
    name: "get_company_handbook",
    description: "회사 핸드북(company_knowledge) 조회",
    parameters: {
      type: "object",
      properties: { query: { type: "string" } },
    },
  },
  {
    name: "get_my_leave_requests",
    description: "본인 연차 신청 내역",
    parameters: {
      type: "object",
      properties: {
        start_date: { type: "string" },
        end_date: { type: "string" },
      },
    },
  },
  {
    name: "prepare_leave_request",
    description: "신청 검사 및 확인 토큰 발급(저장 안 함)",
    parameters: {
      type: "object",
      properties: {
        leave_type_id: { type: "string" },
        start_date: { type: "string" },
        end_date: { type: "string" },
        reason: { type: "string" },
      },
      required: ["leave_type_id", "start_date", "end_date"],
    },
  },
];

type ChatRequestBody = {
  conversation_id?: string | null;
  message?: string;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return jsonError(401, "UNAUTHORIZED", "로그인이 필요합니다.");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return jsonError(401, "UNAUTHORIZED", "로그인이 필요합니다.");
    }

    const { data: employee } = await supabase
      .from("employees")
      .select("id, full_name")
      .eq("id", user.id)
      .maybeSingle();
    if (!employee) {
      return jsonError(403, "FORBIDDEN", "직원 프로필이 없습니다.");
    }

    const body = (await req.json()) as ChatRequestBody;
    const message = body.message?.trim();
    if (!message) {
      return jsonError(400, "VALIDATION_ERROR", "message는 필수입니다.");
    }

    let conversationId = body.conversation_id ?? null;
    if (conversationId) {
      const { data: conv } = await supabase
        .from("assistant_conversations")
        .select("id, expires_at")
        .eq("id", conversationId)
        .eq("employee_id", user.id)
        .maybeSingle();
      if (!conv) {
        return jsonError(
          404,
          "CONVERSATION_NOT_FOUND",
          "대화를 찾을 수 없습니다.",
        );
      }
      if (new Date(conv.expires_at) < new Date()) {
        return jsonError(
          410,
          "CONVERSATION_EXPIRED",
          "대화가 만료되었습니다. 새 대화를 시작해 주세요.",
        );
      }
    } else {
      const { data: created, error: createErr } = await supabase
        .from("assistant_conversations")
        .insert({ employee_id: user.id })
        .select("id")
        .single();
      if (createErr || !created) {
        return jsonError(500, "INTERNAL_ERROR", "대화를 시작하지 못했습니다.");
      }
      conversationId = created.id;
    }

    await supabase.from("assistant_messages").insert({
      conversation_id: conversationId,
      role: "user",
      content: message,
    });

    const { data: historyRows } = await supabase
      .from("assistant_messages")
      .select("role, content")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(20);

    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiKey) {
      const fallback = buildAnswer(
        conversationId!,
        "챗봇 AI 키가 설정되지 않았습니다. 관리자에게 문의해 주세요.",
      );
      await persistAssistant(supabase, conversationId!, fallback);
      return jsonOk(fallback);
    }

    const contents = (historyRows ?? []).map((row) => ({
      role: row.role === "assistant" ? "model" : "user",
      parts: [{ text: row.content }],
    }));

    const seoulToday = new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Seoul",
    });

    let responseJson = await runGeminiLoop({
      apiKey: geminiKey,
      contents,
      supabase,
      userId: user.id,
      today: seoulToday,
    });

    if (!responseJson) {
      responseJson = buildAnswer(
        conversationId!,
        "답변을 만들지 못했어요. 다시 시도해 주세요.",
      );
    } else {
      responseJson = {
        ...responseJson,
        conversation_id: conversationId!,
      };
    }

    await persistAssistant(supabase, conversationId!, responseJson);
    return jsonOk(responseJson);
  } catch (err) {
    console.error(err);
    return jsonError(500, "INTERNAL_ERROR", "서버 오류가 발생했습니다.");
  }
});

async function runGeminiLoop(args: {
  apiKey: string;
  contents: Array<{
    role: string;
    parts: Array<{
      text?: string;
      functionCall?: unknown;
      functionResponse?: unknown;
    }>;
  }>;
  supabase: SupabaseClient;
  userId: string;
  today: string;
}): Promise<Record<string, unknown> | null> {
  const contents = [...args.contents];
  const model = "gemini-3.5-flash-lite";
  const GEMINI_TIMEOUT_MS = 10_000;
  const MAX_STEPS = 4;

  for (let step = 0; step < MAX_STEPS; step++) {
    let geminiRes: Response;
    try {
      geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${args.apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: {
              parts: [
                {
                  text: `${SYSTEM_PROMPT}\n오늘(Asia/Seoul): ${args.today}`,
                },
              ],
            },
            contents,
            tools: [{ functionDeclarations: TOOL_DECLARATIONS }],
          }),
          signal: AbortSignal.timeout(GEMINI_TIMEOUT_MS),
        },
      );
    } catch (err) {
      console.error("Gemini fetch failed", err);
      return {
        type: "answer",
        message: "AI 응답이 지연되고 있어요. 잠시 후 다시 시도해 주세요.",
        payload: {},
      };
    }

    if (!geminiRes.ok) {
      const errBody = await geminiRes.text();
      console.error("Gemini error", errBody);
      if (geminiRes.status === 503 || geminiRes.status === 429) {
        return {
          type: "answer",
          message: "AI가 일시적으로 혼잡합니다. 잠시 후 다시 시도해 주세요.",
          payload: {},
        };
      }
      return null;
    }

    const geminiJson = await geminiRes.json();
    const candidate = geminiJson.candidates?.[0]?.content;
    if (!candidate?.parts?.length) return null;

    contents.push({ role: "model", parts: candidate.parts });

    const functionCalls = candidate.parts.filter(
      (p: {
        functionCall?: { name: string; args?: Record<string, unknown> };
      }) => p.functionCall,
    );

    if (functionCalls.length > 0) {
      const responseParts = [];
      for (const part of functionCalls) {
        const fc = part.functionCall!;
        const result = await executeTool(
          args.supabase,
          args.userId,
          fc.name,
          fc.args ?? {},
        );
        responseParts.push({
          functionResponse: {
            name: fc.name,
            response: result,
          },
        });
      }
      contents.push({ role: "user", parts: responseParts });
      continue;
    }

    const text = candidate.parts
      .map((p: { text?: string }) => p.text)
      .filter(Boolean)
      .join("\n")
      .trim();
    return parseAssistantJson(text);
  }
  return null;
}

async function executeTool(
  supabase: SupabaseClient,
  userId: string,
  name: string,
  args: Record<string, unknown>,
): Promise<unknown> {
  try {
    switch (name) {
      case "get_my_leave_balance": {
        const year =
          typeof args.year === "number" ? args.year : new Date().getFullYear();
        const { data, error } = await supabase.rpc(
          "get_leave_balance_snapshot",
          { p_employee_id: userId, p_year: year },
        );
        if (error) return { error: error.message };
        return data ?? { error: "잔액 행이 없습니다." };
      }
      case "get_leave_policy": {
        const [types, settings, rules] = await Promise.all([
          supabase
            .from("leave_types")
            .select("id, name, deduction_days, is_active")
            .eq("is_active", true),
          supabase
            .from("company_settings")
            .select(
              "auto_approval_enabled, work_start_time, work_end_time, late_threshold",
            )
            .eq("id", true)
            .maybeSingle(),
          supabase
            .from("approval_rules")
            .select(
              "id, rule_name, max_consecutive_days, min_notice_days, is_active",
            )
            .eq("is_active", true),
        ]);
        return {
          leave_types: types.data ?? [],
          company_settings: settings.data,
          approval_rules: rules.data ?? [],
        };
      }
      case "get_company_handbook": {
        const { data } = await supabase
          .from("company_knowledge")
          .select("slug, title, body_md")
          .order("slug");
        return { documents: data ?? [] };
      }
      case "get_my_leave_requests": {
        let q = supabase
          .from("leave_requests")
          .select(
            "id, leave_type_id, start_date, end_date, total_days, status, approval_type, decision_reason, leave_types(name)",
          )
          .eq("employee_id", userId)
          .order("start_date", { ascending: false })
          .limit(30);
        if (typeof args.start_date === "string") {
          q = q.gte("end_date", args.start_date);
        }
        if (typeof args.end_date === "string") {
          q = q.lte("start_date", args.end_date);
        }
        const { data, error } = await q;
        if (error) return { error: error.message };
        return {
          requests: (data ?? []).map((r) => ({
            ...r,
            leave_type_name:
              (r as { leave_types?: { name?: string } }).leave_types?.name ??
              null,
            leave_types: undefined,
          })),
        };
      }
      case "prepare_leave_request": {
        const { data, error } = await supabase.rpc("prepare_leave_request", {
          p_leave_type_id: args.leave_type_id,
          p_start_date: args.start_date,
          p_end_date: args.end_date,
          p_reason: args.reason ?? null,
        });
        if (error) return { error: error.message };
        return data;
      }
      default:
        return { error: `Unknown tool: ${name}` };
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
}

function parseAssistantJson(text: string): Record<string, unknown> | null {
  const fenced = text.match(/\{[\s\S]*\}/);
  if (!fenced) {
    return {
      type: "answer",
      message: text || "응답이 비어 있습니다.",
      payload: {},
    };
  }
  try {
    const parsed = JSON.parse(fenced[0]) as Record<string, unknown>;
    if (!parsed.type || !parsed.message) {
      return { type: "answer", message: text, payload: {} };
    }
    if (!parsed.payload || typeof parsed.payload !== "object") {
      parsed.payload = {};
    }
    // prepare 결과가 can_submit false면 blocked로 정규화 가능
    if (
      parsed.type === "leave_confirmation" &&
      parsed.payload &&
      (parsed.payload as { can_submit?: boolean }).can_submit === false
    ) {
      const p = parsed.payload as {
        reason_codes?: string[];
        review_reasons?: string[];
        available_days?: number;
        requested_days?: number;
        total_days?: number;
      };
      return {
        type: "blocked",
        message: String(parsed.message),
        payload: {
          reason_codes: p.reason_codes ?? p.review_reasons ?? [],
          available_days: p.available_days,
          requested_days: p.requested_days ?? p.total_days,
        },
      };
    }
    return parsed;
  } catch {
    return { type: "answer", message: text, payload: {} };
  }
}

function buildAnswer(conversationId: string, message: string) {
  return {
    conversation_id: conversationId,
    type: "answer",
    message,
    payload: {},
  };
}

async function persistAssistant(
  supabase: SupabaseClient,
  conversationId: string,
  response: Record<string, unknown>,
) {
  await supabase.from("assistant_messages").insert({
    conversation_id: conversationId,
    role: "assistant",
    content: String(response.message ?? ""),
    response_json: response,
  });
}

function jsonOk(data: unknown) {
  return new Response(JSON.stringify({ data }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function jsonError(status: number, code: string, message: string) {
  return new Response(
    JSON.stringify({ error: { code, message, details: {} } }),
    {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
}
