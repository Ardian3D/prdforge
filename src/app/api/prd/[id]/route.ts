import { type NextRequest } from "next/server";
import { z } from "zod";
import { withAuth } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { ApiError, ok } from "@/lib/server/http";
import { getOwnedPrd, type PrdContent } from "@/lib/server/prd";

// GET /api/prd/{id} — ambil PRD lengkap.
export const GET = withAuth(async (_req, ctx, { user }) => {
  const { id } = await ctx.params;
  const prd = await getOwnedPrd(id, user.id);
  const content = prd.content as unknown as PrdContent;
  return ok({
    id: prd.id,
    title: prd.title,
    descriptionInput: prd.descriptionInput,
    sections: content?.sections ?? [],
    mermaidDiagrams: prd.mermaidDiagrams,
    language: prd.language,
    version: prd.version,
    isArchived: prd.isArchived,
    createdAt: prd.createdAt,
    updatedAt: prd.updatedAt,
  });
});

const patchSchema = z.object({
  title: z.string().trim().min(1).max(160).optional(),
  isArchived: z.boolean().optional(),
});

// PATCH /api/prd/{id} — rename / archive.
export const PATCH = withAuth(async (req: NextRequest, ctx, { user }) => {
  const { id } = await ctx.params;
  await getOwnedPrd(id, user.id);
  const json = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    throw new ApiError("Input tidak valid", 422, "VALIDATION_ERROR");
  }
  const updated = await db.prd.update({ where: { id }, data: parsed.data });
  return ok({ id: updated.id, title: updated.title, isArchived: updated.isArchived });
});

// DELETE /api/prd/{id}
export const DELETE = withAuth(async (_req, ctx, { user }) => {
  const { id } = await ctx.params;
  await getOwnedPrd(id, user.id);
  await db.prd.delete({ where: { id } });
  return ok({ deleted: true });
});
