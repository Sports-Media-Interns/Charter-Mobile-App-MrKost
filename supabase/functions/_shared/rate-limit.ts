import { getServiceClient } from "./supabase-client.ts";

interface RateLimitOptions {
  windowMs?: number;
  max?: number;
}

export async function checkRateLimit(
  key: string,
  options: RateLimitOptions = {},
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const { windowMs = 60_000, max = 60 } = options;
  const now = Date.now();
  const windowStart = now - windowMs;

  const supabase = getServiceClient();

  // Upsert a rate limit entry and increment count atomically
  const { data, error } = await supabase.rpc("check_rate_limit", {
    p_key: key,
    p_window_ms: windowMs,
    p_max_requests: max,
  });

  if (error || !data) {
    // Fallback: allow on DB error to avoid blocking legitimate requests
    console.error("Rate limit check failed:", error);
    return { allowed: true, remaining: max, resetAt: now + windowMs };
  }

  return {
    allowed: data.allowed,
    remaining: data.remaining,
    resetAt: data.reset_at,
  };
}

export function getRateLimitHeaders(
  result: { remaining: number; resetAt: number },
): Record<string, string> {
  return {
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
  };
}

export function rateLimitResponse(resetAt: number): Response {
  return new Response(JSON.stringify({ error: "Too many requests" }), {
    status: 429,
    headers: {
      "Content-Type": "application/json",
      "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)),
    },
  });
}
