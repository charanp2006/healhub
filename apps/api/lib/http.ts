const CORS_ORIGINS = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

function normalizeOrigin(origin?: string | null): string | null {
  if (!origin) return null;
  // Strip a trailing slash if present (e.g. http://localhost:3000/)
  return origin.replace(/\/+$/, "");
}

export function corsHeaders(request?: Request): Record<string, string> {
  const allowed = CORS_ORIGINS.length ? CORS_ORIGINS : ["*"];
  const reqOrigin = normalizeOrigin(request?.headers.get("Origin"));

  let allowOrigin: string;
  if (allowed.length === 1 && allowed[0] === "*") {
    allowOrigin = "*";
  } else if (reqOrigin && allowed.map(normalizeOrigin).includes(reqOrigin)) {
    // Echo only the single, explicitly-allowlisted origin that made the request.
    allowOrigin = reqOrigin;
  } else {
    // No matching/recognized origin: do not allow the browser to proceed.
    // (Cannot use "*" alongside credentials, so omit the header entirely.)
    allowOrigin = "";
  }

  return {
    ...(allowOrigin ? { "Access-Control-Allow-Origin": allowOrigin } : {}),
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, token, atoken, dtoken, htoken",
    "Access-Control-Allow-Credentials": "true",
    // Baseline security headers applied to every API response.
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Vary": "Origin",
  };
}

export function json(
  body: unknown,
  status = 200,
  request?: Request
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(request),
    },
  });
}

export function handleOptions(request: Request): Response {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(request),
  });
}

export function ok(data: Record<string, unknown>, request?: Request): Response {
  return json({ success: true, ...data }, 200, request);
}

export function bad(message: string, request?: Request): Response {
  return json({ success: false, message }, 401, request);
}

export function tooMany(
  message: string,
  retryAfterSeconds: number,
  request?: Request
): Response {
  return new Response(JSON.stringify({ success: false, message }), {
    status: 429,
    headers: {
      "Content-Type": "application/json",
      "Retry-After": String(retryAfterSeconds),
      ...corsHeaders(request),
    },
  });
}

export async function parseJson<T = Record<string, unknown>>(
  request: Request
): Promise<T> {
  return (await request.json()) as T;
}
