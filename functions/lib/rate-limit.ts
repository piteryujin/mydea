type RateLimitEnv = {
  RATE_LIMIT?: D1Database;
  RATE_LIMIT_SALT?: string;
};

async function digest(value: string) {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(hash)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function consumeAnalysisQuota(
  request: Request,
  env: RateLimitEnv,
) {
  if (!env.RATE_LIMIT) return { allowed: true, remaining: 2 };

  const day = new Date().toISOString().slice(0, 10);
  const ip = request.headers.get("CF-Connecting-IP") ?? "local";
  const device = request.headers.get("X-MYDEA-Device") ?? "unknown";
  const key = await digest(
    `${env.RATE_LIMIT_SALT ?? "mydea"}:${day}:${ip}:${device}`,
  );

  await env.RATE_LIMIT.prepare(
    `INSERT INTO usage_limits (key, usage_date, count)
     VALUES (?1, ?2, 1)
     ON CONFLICT(key, usage_date)
     DO UPDATE SET count = count + 1`,
  )
    .bind(key, day)
    .run();

  const row = await env.RATE_LIMIT.prepare(
    "SELECT count FROM usage_limits WHERE key = ?1 AND usage_date = ?2",
  )
    .bind(key, day)
    .first<{ count: number }>();
  const count = row?.count ?? 1;
  return { allowed: count <= 3, remaining: Math.max(0, 3 - count) };
}
