import { type NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/server/db";
import { withAuth, sanitizeUser } from "@/lib/server/auth";
import { ApiError, ok } from "@/lib/server/http";
import { maybeResetUsage, usageSummary } from "@/lib/server/usage";

// GET /api/users/me — profil + ringkasan kuota (US-04). Reset kuota bila perlu.
export const GET = withAuth(async (_req, _ctx, { user }) => {
  const fresh = await maybeResetUsage(user);
  return ok({
    user: sanitizeUser(fresh),
    usage: usageSummary(fresh),
  });
});

const updateSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
});

// PATCH /api/users/me — update profil dasar.
export const PATCH = withAuth(async (req: NextRequest, _ctx, { user }) => {
  const json = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(json);
  if (!parsed.success) {
    throw new ApiError(
      parsed.error.issues[0]?.message ?? "Input tidak valid",
      422,
      "VALIDATION_ERROR"
    );
  }
  const updated = await db.user.update({
    where: { id: user.id },
    data: { ...parsed.data },
  });
  return ok({ user: sanitizeUser(updated) });
});
