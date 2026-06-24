import { type NextRequest } from "next/server";
import { z } from "zod";
import { withAuth } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { ApiError, ok, handleError } from "@/lib/server/http";
import {
  getOwnedPrd,
  mergeSections,
  consumeRevision,
  refundRevision,
  type PrdContent,
} from "@/lib/server/prd";
import { reviseSection, extractMermaid, type PrdSection } from "@/lib/server/deepseek";
import { maybeResetUsage } from "@/lib/server/usage";

const schema = z.object({
  message: z.string().trim().min(1, "Pesan kosong").max(1000),
});

// POST /api/prd/{id}/chat — revisi PRD via chat AI (US-06).
export const POST = withAuth(async (req: NextRequest, ctx, { user }) => {
  try {
    const { id } = await ctx.params;
    const prd = await getOwnedPrd(id, user.id);

    const json = await req.json().catch(() => null);
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      throw new ApiError(
        parsed.error.issues[0]?.message ?? "Input tidak valid",
        422,
        "VALIDATION_ERROR"
      );
    }
    const { message } = parsed.data;

    const fresh = await maybeResetUsage(user);
    await consumeRevision(fresh);

    // Simpan pesan user.
    await db.chatMessage.create({
      data: { prdId: id, userId: user.id, role: "user", content: message },
    });

    const content = prd.content as unknown as PrdContent;
    const sections: PrdSection[] = content?.sections ?? [];

    let revision;
    try {
      revision = await reviseSection(sections, message, prd.language);
    } catch (err) {
      await refundRevision(fresh);
      throw err;
    }

    const merged = mergeSections(sections, revision.sections);
    const diagrams = extractMermaid(merged);

    await db.prd.update({
      where: { id },
      data: {
        content: { sections: merged } as unknown as object,
        mermaidDiagrams: diagrams as unknown as object,
      },
    });

    await db.chatMessage.create({
      data: { prdId: id, userId: user.id, role: "assistant", content: revision.reply },
    });

    return ok({
      reply: revision.reply,
      updatedSections: revision.sections.map((s) => s.title),
      sections: merged,
    });
  } catch (error) {
    return handleError(error);
  }
});

// GET /api/prd/{id}/chat — riwayat chat.
export const GET = withAuth(async (_req, ctx, { user }) => {
  const { id } = await ctx.params;
  await getOwnedPrd(id, user.id);
  const messages = await db.chatMessage.findMany({
    where: { prdId: id },
    orderBy: { createdAt: "asc" },
    select: { id: true, role: true, content: true, createdAt: true },
  });
  return ok({ messages });
});
