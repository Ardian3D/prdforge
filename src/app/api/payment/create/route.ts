import { type NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/server/db";
import { withAuth } from "@/lib/server/auth";
import { ApiError, ok } from "@/lib/server/http";
import { env } from "@/lib/server/env";
import { getTierConfig, PAID_TIERS } from "@/lib/server/tiers";
import { createSnapTransaction, midtransConfigured } from "@/lib/server/midtrans";
import crypto from "node:crypto";

const createSchema = z.object({
  tier: z.enum(["starter", "pro", "probundle"]),
});

// POST /api/payment/create — buat order pembayaran untuk upgrade tier (US-06).
//
// Kebijakan biaya VA = "Merchant Pays": gross_amount = harga tier (tanpa
// surcharge). Biaya admin VA ditanggung merchant.
export const POST = withAuth(async (req: NextRequest, _ctx, { user }) => {
  const json = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    throw new ApiError("Tier tidak valid", 422, "VALIDATION_ERROR");
  }
  const { tier } = parsed.data;
  if (!PAID_TIERS.includes(tier)) {
    throw new ApiError("Tier tidak bisa dibeli", 400, "INVALID_TIER");
  }

  const config = getTierConfig(tier);
  const orderId = `PRDF-${tier}-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;

  const payment = await db.payment.create({
    data: {
      userId: user.id,
      externalId: orderId,
      status: "pending",
      amount: config.priceMonthly,
      tierPurchased: tier,
      provider: "midtrans",
    },
  });

  // Produksi: buat transaksi Snap. Dev tanpa server key → mode simulasi.
  if (midtransConfigured()) {
    const { token, redirectUrl } = await createSnapTransaction({
      orderId,
      grossAmount: config.priceMonthly, // tanpa biaya admin VA (Merchant Pays)
      customer: { email: user.email, name: user.name },
      item: {
        id: tier,
        price: config.priceMonthly,
        quantity: 1,
        name: `PRDForge ${config.name} (1 bulan)`,
      },
      finishUrl: `${env.appUrl}/dashboard/billing?order=${orderId}`,
      expiryMinutes: 60,
    });

    return ok({
      orderId,
      paymentId: payment.id,
      amount: config.priceMonthly,
      tier,
      snapToken: token,
      redirectUrl,
      gateway: "midtrans",
    });
  }

  // DEV: tanpa gateway. Front-end bisa simulasikan sukses via webhook.
  return ok({
    orderId,
    paymentId: payment.id,
    amount: config.priceMonthly,
    tier,
    redirectUrl: `${env.appUrl}/dashboard/billing?order=${orderId}&simulate=1`,
    gateway: "simulation",
  });
});
