import { type NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/server/db";
import { withAuth } from "@/lib/server/auth";
import { ApiError, ok } from "@/lib/server/http";
import { usageFieldsForTier } from "@/lib/server/usage";
import {
  fetchTransactionStatus,
  mapMidtransStatus,
  midtransConfigured,
} from "@/lib/server/midtrans";
import type { PaymentStatus } from "@prisma/client";

const querySchema = z.object({
  order: z.string().min(1),
});

// GET /api/payment/status?order=<externalId>
//
// Konfirmasi status pembayaran milik user yang sedang login. Dipakai halaman
// billing saat customer kembali dari Midtrans (finishUrl). Penting untuk
// pengembangan lokal: webhook Midtrans TIDAK bisa menjangkau localhost, jadi
// endpoint ini menanyakan status LANGSUNG ke Midtrans (source of truth) lalu
// meng-upgrade tier bila pembayaran sukses. Aman karena:
//   - dilindungi auth (hanya pemilik order),
//   - status diambil langsung dari Midtrans, bukan dari input client,
//   - idempoten (order yang sudah success tidak diproses ulang).
export const GET = withAuth(async (req: NextRequest, _ctx, { user }) => {
  const { searchParams } = new URL(req.url);
  const parsed = querySchema.safeParse({ order: searchParams.get("order") });
  if (!parsed.success) {
    throw new ApiError("Parameter order wajib diisi", 422, "VALIDATION_ERROR");
  }
  const orderId = parsed.data.order;

  const payment = await db.payment.findUnique({
    where: { externalId: orderId },
  });
  if (!payment || payment.userId !== user.id) {
    throw new ApiError("Order tidak ditemukan", 404, "ORDER_NOT_FOUND");
  }

  // Sudah final & sukses → idempoten, kembalikan apa adanya.
  if (payment.status === "success") {
    return ok({ orderId, status: payment.status, tier: payment.tierPurchased, upgraded: false });
  }

  // Tanpa gateway (dev simulasi) → tidak ada yang bisa dikonfirmasi di sini.
  if (!midtransConfigured()) {
    return ok({ orderId, status: payment.status, tier: payment.tierPurchased, upgraded: false });
  }

  // Tanyakan status langsung ke Midtrans (source of truth).
  const status = await fetchTransactionStatus(orderId);

  // Cocokkan nominal untuk mencegah manipulasi.
  if (status.grossAmount) {
    const paid = Math.round(parseFloat(status.grossAmount));
    const expected = Math.round(Number(payment.amount));
    if (paid !== expected) {
      throw new ApiError("Nominal pembayaran tidak cocok", 400, "AMOUNT_MISMATCH");
    }
  }

  const newStatus: PaymentStatus = mapMidtransStatus(
    status.transactionStatus,
    status.fraudStatus
  );

  let upgraded = false;
  if (newStatus !== payment.status) {
    await db.payment.update({
      where: { id: payment.id },
      data: { status: newStatus },
    });
  }

  if (newStatus === "success") {
    await db.user.update({
      where: { id: payment.userId },
      data: usageFieldsForTier(payment.tierPurchased),
    });
    upgraded = true;
  }

  return ok({ orderId, status: newStatus, tier: payment.tierPurchased, upgraded });
});
