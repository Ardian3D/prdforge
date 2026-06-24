import { type NextRequest } from "next/server";
import { withAdmin, sanitizeUser } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { ok } from "@/lib/server/http";
import type { Prisma } from "@prisma/client";

// GET /api/admin/users?page=&search=&tier= — daftar user + total (US admin).
export const GET = withAdmin(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(
    100,
    Math.max(1, Number(searchParams.get("pageSize") ?? "20"))
  );
  const search = searchParams.get("search")?.trim();
  const tier = searchParams.get("tier")?.trim();

  const where: Prisma.UserWhereInput = {};
  if (search) {
    where.OR = [
      { email: { contains: search, mode: "insensitive" } },
      { name: { contains: search, mode: "insensitive" } },
    ];
  }
  if (tier && ["free", "starter", "pro", "probundle"].includes(tier)) {
    where.tier = tier as Prisma.UserWhereInput["tier"];
  }

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.user.count({ where }),
  ]);

  return ok({
    users: users.map(sanitizeUser),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
});
