import { withAuth } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { ok } from "@/lib/server/http";

// GET /api/payments — riwayat pembayaran milik user (billing page).
export const GET = withAuth(async (_req, _ctx, { user }) => {
  const payments = await db.payment.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      externalId: true,
      status: true,
      amount: true,
      tierPurchased: true,
      provider: true,
      createdAt: true,
    },
  });
  return ok({
    payments: payments.map((p) => ({ ...p, amount: Number(p.amount) })),
  });
});
