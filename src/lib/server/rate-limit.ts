// Rate limiter sederhana berbasis in-memory (sliding window per fixed interval).
// PRD merekomendasikan Redis untuk produksi — implementasi ini sengaja dibuat
// di balik fungsi `rateLimit` agar mudah di-swap ke Upstash/Redis nanti.

interface Bucket {
  count: number;
  resetAt: number;
}

const store = new Map<string, Bucket>();

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: number; // epoch ms
}

/**
 * @param key   identitas unik (mis. `ip:1.2.3.4` atau `user:<id>`)
 * @param limit jumlah maksimum request per window
 * @param windowMs durasi window dalam ms (default 60s)
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs = 60_000
): RateLimitResult {
  const now = Date.now();
  const bucket = store.get(key);

  if (!bucket || bucket.resetAt <= now) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return { success: true, limit, remaining: limit - 1, resetAt };
  }

  bucket.count += 1;
  const remaining = Math.max(0, limit - bucket.count);
  return {
    success: bucket.count <= limit,
    limit,
    remaining,
    resetAt: bucket.resetAt,
  };
}

// Bersihkan bucket kedaluwarsa sesekali agar map tidak tumbuh tak terbatas.
let lastSweep = Date.now();
export function sweepExpired() {
  const now = Date.now();
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, bucket] of store.entries()) {
    if (bucket.resetAt <= now) store.delete(key);
  }
}
