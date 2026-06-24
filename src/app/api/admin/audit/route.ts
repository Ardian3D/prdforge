import { type NextRequest } from "next/server";
import { withAdmin } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { ok } from "@/lib/server/http";
import type { Prisma } from "@prisma/client";

// GET /api/admin/audit?action=&page= — log anti-fraud untuk admin audit.
export const GET = withAdmin(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") ?? "50")));
  const action = searchParams.get("action")?.trim();

  const where: Prisma.FraudLogWhereInput = {};
  if (action && ["blocked", "flagged", "allowed"].includes(action)) {
    where.action = action as Prisma.FraudLogWhereInput["action"];
  }

  const [logs, total, counts] = await Promise.all([
    db.fraudLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.fraudLog.count({ where }),
    db.fraudLog.groupBy({ by: ["action"], _count: { _all: true } }),
  ]);

  const actionCounts: Record<string, number> = { blocked: 0, flagged: 0, allowed: 0 };
  for (const c of counts) actionCounts[c.action] = c._count._all;

  return ok({ logs, total, page, pageSize, actionCounts });
});
