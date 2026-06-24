import { withAdmin } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { decrypt } from "@/lib/server/crypto";
import { ApiError, ok } from "@/lib/server/http";

const DEEPSEEK_BASE = "https://api.deepseek.com";

// POST /api/admin/apikey/test — uji koneksi ke DeepSeek (US-03).
export const POST = withAdmin(async () => {
  const config = await db.apiConfig.findFirst({ orderBy: { updatedAt: "desc" } });
  if (!config?.apiKeyEncrypted) {
    throw new ApiError("API key belum dikonfigurasi", 400, "NO_API_KEY");
  }

  let apiKey: string;
  try {
    apiKey = decrypt(config.apiKeyEncrypted);
  } catch {
    throw new ApiError(
      "Gagal mendekripsi API key (ENCRYPTION_KEY berubah?)",
      500,
      "DECRYPT_FAILED"
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  const start = Date.now();
  try {
    const resp = await fetch(`${DEEPSEEK_BASE}/models`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: controller.signal,
    });
    const latencyMs = Date.now() - start;
    if (!resp.ok) {
      return ok({
        status: "error",
        httpStatus: resp.status,
        latencyMs,
        message:
          resp.status === 401
            ? "API key ditolak (unauthorized)"
            : `DeepSeek merespons ${resp.status}`,
      });
    }
    return ok({ status: "ok", latencyMs });
  } catch (err) {
    const aborted = err instanceof Error && err.name === "AbortError";
    return ok({
      status: "error",
      latencyMs: Date.now() - start,
      message: aborted ? "Timeout (8s)" : "Gagal menghubungi DeepSeek",
    });
  } finally {
    clearTimeout(timeout);
  }
});
