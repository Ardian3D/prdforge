import { type NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/server/db";
import { withAuth } from "@/lib/server/auth";
import { ApiError, created, handleError } from "@/lib/server/http";
import { rateLimit } from "@/lib/server/rate-limit";
import { getClientIp } from "@/lib/server/fraud";
import { getTierConfig } from "@/lib/server/tiers";
import { maybeResetUsage } from "@/lib/server/usage";
import {
  consumeGeneration,
  refundGeneration,
  type PrdContent,
} from "@/lib/server/prd";
import { generatePrd, extractMermaid } from "@/lib/server/deepseek";

const schema = z.object({
  productName: z.string().trim().max(160).optional(),
  description: z.string().trim().min(20, "Deskripsi minimal 20 karakter").max(2000),
  language: z.enum(["id", "en"]).default("id"),
});

// POST /api/prd/generate — generate PRD 19-section via DeepSeek (US-01).
export const POST = withAuth(async (req: NextRequest, _ctx, { user }) => {
  try {
    // Rate limit per tier (NFR section 15).
    const ip = getClientIp(req);
    const limit = getTierConfig(user.tier).rateLimitPerMinute;
    if (!rateLimit(`gen:${user.id}:${ip}`, limit, 60_000).success) {
      throw new ApiError("Terlalu banyak permintaan. Coba sebentar lagi.", 429, "RATE_LIMITED");
    }

    const json = await req.json().catch(() => null);
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      throw new ApiError(
        parsed.error.issues[0]?.message ?? "Input tidak valid",
        422,
        "VALIDATION_ERROR"
      );
    }
    const { productName, description, language } = parsed.data;

    // Reset kuota bulanan bila perlu, lalu konsumsi 1 kuota generate.
    const fresh = await maybeResetUsage(user);
    await consumeGeneration(fresh);

    // Panggil AI. Bila gagal → kembalikan kuota.
    let generated;
    try {
      generated = await generatePrd(description, language, productName);
    } catch (err) {
      await refundGeneration(fresh);
      throw err;
    }

    const content: PrdContent = { sections: generated.sections };
    const diagrams = extractMermaid(generated.sections);

    const prd = await db.prd.create({
      data: {
        userId: user.id,
        title: generated.title,
        descriptionInput: description,
        content: content as unknown as object,
        mermaidDiagrams: diagrams as unknown as object,
        language,
      },
    });

    return created({
      id: prd.id,
      title: prd.title,
      sections: generated.sections,
      language,
    });
  } catch (error) {
    return handleError(error);
  }
});
