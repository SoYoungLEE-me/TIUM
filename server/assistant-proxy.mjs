/**
 * API gateway (assistant only): OpenAPI path → Supabase Edge Function.
 *
 *   POST /api/assistant/messages
 *     → {SUPABASE_URL}/functions/v1/assistant-messages
 *
 * Env:
 *   PORT                 (default 3000) — matches VITE_API_BASE_URL / OpenAPI servers
 *   SUPABASE_URL         e.g. http://127.0.0.1:54321 or https://xxxx.supabase.co
 *   SUPABASE_ANON_KEY    forwarded as apikey when client omits it
 *
 * Run: npm run dev:api
 * Requires: supabase functions serve (or hosted Edge) for assistant-messages.
 */

import http from "node:http";

const PORT = Number(process.env.PORT || 3000);
const SUPABASE_URL = (process.env.SUPABASE_URL || "").replace(/\/$/, "");
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "";
const EDGE_PATH = "/functions/v1/assistant-messages";
const OPENAPI_PATH = "/api/assistant/messages";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function sendJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    ...corsHeaders,
    "Content-Type": "application/json",
  });
  res.end(payload);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

  if (req.method === "OPTIONS" && url.pathname === OPENAPI_PATH) {
    res.writeHead(204, corsHeaders);
    res.end();
    return;
  }

  if (req.method === "POST" && url.pathname === OPENAPI_PATH) {
    if (!SUPABASE_URL) {
      sendJson(res, 500, {
        error: {
          code: "PROXY_MISCONFIGURED",
          message: "SUPABASE_URL이 설정되지 않았습니다.",
          details: {},
        },
      });
      return;
    }

    try {
      const body = await readBody(req);
      const auth = req.headers.authorization || "";
      const rawApikey = req.headers.apikey;
      const apikey =
        (Array.isArray(rawApikey) ? rawApikey[0] : rawApikey) ||
        SUPABASE_ANON_KEY;

      const upstream = await fetch(`${SUPABASE_URL}${EDGE_PATH}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(auth ? { Authorization: auth } : {}),
          ...(apikey ? { apikey: String(apikey) } : {}),
        },
        body: body.length ? body : undefined,
      });

      const text = await upstream.text();
      res.writeHead(upstream.status, {
        ...corsHeaders,
        "Content-Type":
          upstream.headers.get("content-type") || "application/json",
      });
      res.end(text);
    } catch (err) {
      console.error("[assistant-proxy]", err);
      sendJson(res, 502, {
        error: {
          code: "BAD_GATEWAY",
          message: "Edge Function 프록시에 실패했습니다.",
          details: {},
        },
      });
    }
    return;
  }

  sendJson(res, 404, {
    error: {
      code: "NOT_FOUND",
      message: `이 게이트웨이는 ${OPENAPI_PATH} 만 프록시합니다.`,
      details: { path: url.pathname },
    },
  });
});

server.listen(PORT, () => {
  console.log(
    `[assistant-proxy] http://localhost:${PORT}${OPENAPI_PATH} → ${SUPABASE_URL || "(SUPABASE_URL unset)"}${EDGE_PATH}`,
  );
});
