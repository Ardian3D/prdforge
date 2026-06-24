import { type NextRequest } from "next/server";
import { z } from "zod";
import { withAdmin, sanitizeUser } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { ApiError, ok } from "@/lib/server/http";

const banSchema = z.object({
  banned: z.boolean().default(true),
  reason: z.string().trim().max(500).optional(),
});

// POST /api/admin/users/{id}/ban — ban/unban user (US-09 admin: ban abuser).
export const POST = withAdmin(async (req: NextRequest, ctx, { user: admin }) => {
  const { id } = await ctx.params;

  if (id === admin.id) {
    throw new ApiError("Tidak bisa mem-ban akun sendiri", 400, "SELF_BAN");
  }

  const target = await db.user.findUnique({ where: { id } });
  if (!target) {
    throw new ApiError("User tidak ditemukan", 404, "USER_NOT_FOUND");
  }
  if (target.role === "admin") {
    throw new ApiError("Tidak bisa mem-ban admin lain", 403, "CANNOT_BAN_ADMIN");
  }

  const json = await req.json().catch(() => ({}));
  const parsed = banSchema.safeParse(json ?? {});
  if (!parsed.success) {
    throw new ApiError("Input tidak valid", 422, "VALIDATION_ERROR");
  }
  const { banned, reason } = parsed.data;

  const updated = await db.user.update({
    where: { id },
    data: {
      isBanned: banned,
      banReason: banned ? (reason ?? "Diblokir oleh admin") : null,
    },
  });

  return ok({
    user: sanitizeUser(updated),
    status: updated.isBanned ? "banned" : "active",
  });
});
