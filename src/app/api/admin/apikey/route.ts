import { type NextRequest } from "next/server";
import { z } from "zod";
import { withAdmin } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { encrypt, decrypt, maskSecret } from "@/lib/server/crypto";
import { ApiError, ok } from "@/lib/server/http";

// GET /api/admin/apikey — tampilkan config dengan key ter-mask (US-03).
export const GET = withAdmin(async () => {
  const config = await db.apiConfig.findFirst({ orderBy: { updatedAt: "desc" } });
  if (!config) {
    return ok({ configured: false, provider: "deepseek", model: "deepseek-v4-pro" });
  }
  let masked: string | null = null;
  if (config.apiKeyEncrypted) {
    try {
      masked = maskSecret(decrypt(config.apiKeyEncrypted));
    } catch {
      masked = "••••••••";
    }
  }
  return ok({
    configured: Boolean(config.apiKeyEncrypted),
    provider: config.provider,
    model: config.model,
    isActive: config.isActive,
    maskedKey: masked,
    updatedAt: config.updatedAt,
  });
});

const setSchema = z.object({
  provider: z.string().trim().default("deepseek"),
  apiKey: z.string().trim().min(8, "API key terlalu pendek").max(512),
  model: z.string().trim().min(1).default("deepseek-v4-pro"),
  isActive: z.boolean().default(true),
});

// POST /api/admin/apikey — simpan API key terenkripsi (AES-256-GCM).
export const POST = withAdmin(async (req: NextRequest) => {
  const json = await req.json().catch(() => null);
  const parsed = setSchema.safeParse(json);
  if (!parsed.success) {
    throw new ApiError(
      parsed.error.issues[0]?.message ?? "Input tidak valid",
      422,
      "VALIDATION_ERROR"
    );
  }
  const { provider, apiKey, model, isActive } = parsed.data;
  const apiKeyEncrypted = encrypt(apiKey);

  const config = await db.apiConfig.upsert({
    where: { provider },
    update: { apiKeyEncrypted, model, isActive },
    create: { provider, apiKeyEncrypted, model, isActive },
  });

  return ok({
    status: "saved",
    provider: config.provider,
    model: config.model,
    isActive: config.isActive,
    maskedKey: maskSecret(apiKey),
  });
});
