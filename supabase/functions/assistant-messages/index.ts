/**
 * Chatbot assistant Edge Function (Gemini).
 *
 * Secrets (supabase secrets set):
 * - GEMINI_API_KEY
 * - optional SUPABASE_URL / SUPABASE_ANON_KEY (auto-injected on hosted)
 *
 * Public OpenAPI path: POST /api/assistant/messages
 * Reach this function via API gateway proxy (server/assistant-proxy.mjs):
 *   /api/assistant/messages → /functions/v1/assistant-messages
 * Do not call this Edge URL from the frontend; keep OpenAPI path stable.
 *
 * TODO: tool loop (leave balance / policy / prepare_leave_request),
 * conversation ownership, rate limits — see hr-assistant.md
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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

    const body = (await req.json()) as ChatRequestBody;
    const message = body.message?.trim();
    if (!message) {
      return jsonError(400, "VALIDATION_ERROR", "message는 필수입니다.");
    }

    const conversationId = body.conversation_id ?? crypto.randomUUID();

    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    let reply =
      "챗봇 서버가 준비 중입니다. Gemini 키와 도구 연동을 설정해 주세요.";

    if (geminiKey) {
      // Minimal Gemini call — replace with tool-using agent per hr-assistant.md
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: message }] }],
            systemInstruction: {
              parts: [
                {
                  text: "You are an HR leave assistant. Reply briefly in Korean. Do not invent leave balances.",
                },
              ],
            },
          }),
        },
      );

      if (geminiRes.ok) {
        const geminiJson = (await geminiRes.json()) as {
          candidates?: Array<{
            content?: { parts?: Array<{ text?: string }> };
          }>;
        };
        const text =
          geminiJson.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (text) reply = text;
      } else {
        console.error("Gemini error", await geminiRes.text());
      }
    }

    return new Response(
      JSON.stringify({
        data: {
          conversation_id: conversationId,
          type: "answer",
          message: reply,
          payload: {},
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    console.error(err);
    return jsonError(500, "INTERNAL_ERROR", "서버 오류가 발생했습니다.");
  }
});

function jsonError(status: number, code: string, message: string) {
  return new Response(
    JSON.stringify({ error: { code, message, details: {} } }),
    {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
}
