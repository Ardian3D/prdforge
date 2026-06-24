import { withAdmin } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { ok } from "@/lib/server/http";

// GET /api/admin/stats — ringkasan platform untuk admin overview & stats.
export const GET = withAdmin(async () => {
  const last30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    usersByTier,
    totalPrds,
    prdsLast30,
    bannedUsers,
    newUsers30,
    successPayments,
    fraudBlocked,
    fraudTotal,
  ] = await Promise.all([
    db.user.count(),
    db.user.groupBy({ by: ["tier"], _count: { _all: true } }),
    db.prd.count(),
    db.prd.count({ where: { createdAt: { gte: last30 } } }),
    db.user.count({ where: { isBanned: true } }),
    db.user.count({ where: { createdAt: { gte: last30 } } }),
    db.payment.aggregate({
      where: { status: "success" },
      _sum: { amount: true },
      _count: { _all: true },
    }),
    db.fraudLog.count({ where: { action: "blocked" } }),
    db.fraudLog.count(),
  ]);

  const tierCounts: Record<string, number> = { free: 0, starter: 0, pro: 0, probundle: 0 };
  for (const row of usersByTier) tierCounts[row.tier] = row._count._all;

  const paidUsers = tierCounts.starter + tierCounts.pro + tierCounts.probundle;

  return ok({
    totalUsers,
    newUsers30,
    paidUsers,
    conversionRate: totalUsers > 0 ? +((paidUsers / totalUsers) * 100).toFixed(1) : 0,
    tierCounts,
    totalPrds,
    prdsLast30,
    bannedUsers,
    revenue: Number(successPayments._sum.amount ?? 0),
    successPaymentCount: successPayments._count._all,
    fraudBlocked,
    fraudTotal,
    fraudBlockRate: fraudTotal > 0 ? +((fraudBlocked / fraudTotal) * 100).toFixed(1) : 0,
  });
});
