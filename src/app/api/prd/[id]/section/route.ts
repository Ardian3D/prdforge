import { type NextRequest } from "next/server";
import { z } from "zod";
import { withAuth } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { ApiError, ok } from "@/lib/server/http";
import { getOwnedPrd, mergeSections, type PrdContent } from "@/lib/server/prd";
import { extractMermaid, type PrdSection } from "@/lib/server/deepseek";

const schema = z.object({
  title: z.string().trim().min(1).max(200),
  content: z.string().max(20000),
});

// PATCH /api/prd/{id}/section — update satu section inline (US-02, auto-save).
export const PATCH = withAuth(async (req: NextRequest, ctx, { user }) => {
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

  const content = prd.content as unknown as PrdContent;
  const sections: PrdSection[] = content?.sections ?? [];
  const updated = mergeSections(sections, [parsed.data]);
  const diagrams = extractMermaid(updated);

  await db.prd.update({
    where: { id },
    data: {
      content: { sections: updated } as unknown as object,
      mermaidDiagrams: diagrams as unknown as object,
    },
  });

  return ok({ id, updatedAt: new Date().toISOString() });
});
