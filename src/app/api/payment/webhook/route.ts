import { type NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/server/db";
import { ApiError, handleError, ok } from "@/lib/server/http";
import { usageFieldsForTier } from "@/lib/server/usage";
import {
  fetchTransactionStatus,
  mapMidtransStatus,
  midtransConfigured,
  verifyNotificationSignature,
} from "@/lib/server/midtrans";
import type { PaymentStatus } from "@prisma/client";

// Bentuk notifikasi Midtrans (subset) + mode simulasi dev.
const webhookSchema = z.object({
  order_id: z.string(),
  status_code: z.string().optional(),
  gross_amount: z.string().optional(),
  transaction_status: z.string().optional(),
  fraud_status: z.string().optional(),
  signature_key: z.string().optional(),
  simulate_status: z.enum(["success", "failed"]).optional(),
});

// POST /api/payment/webhook — terima notifikasi Midtrans, upgrade tier bila sukses.
export async function POST(req: NextRequest) {
  try {
    const json = await req.json().catch(() => null);
    const parsed = webhookSchema.safeParse(json);
    if (!parsed.success) {
      throw new ApiError("Payload webhook tidak valid", 422, "VALIDATION_ERROR");
    }
    const body = parsed.data;

    const payment = await db.payment.findUnique({
      where: { externalId: body.order_id },
    });
    if (!payment) {
      throw new ApiError("Order tidak ditemukan", 404, "ORDER_NOT_FOUND");
    }

    let newStatus: PaymentStatus;

    if (midtransConfigured()) {
      // 1) Verifikasi signature notifikasi (anti-spoof).
      const validSig = verifyNotificationSignature({
        orderId: body.order_id,
        statusCode: body.status_code ?? "",
        grossAmount: body.gross_amount ?? "",
        signatureKey: body.signature_key ?? "",
      });
      if (!validSig) {
        throw new ApiError("Signature tidak valid", 401, "INVALID_SIGNATURE");
      }

      // 2) Konfirmasi status LANGSUNG ke Midtrans (source of truth), jangan
      //    hanya percaya payload. Mencegah notifikasi palsu/usang.
      const status = await fetchTransactionStatus(body.order_id);

      // 3) Cocokkan nominal untuk mencegah manipulasi.
      if (status.grossAmount) {
        const paid = Math.round(parseFloat(status.grossAmount));
        const expected = Math.round(Number(payment.amount));
        if (paid !== expected) {
          throw new ApiError("Nominal pembayaran tidak cocok", 400, "AMOUNT_MISMATCH");
        }
      }

      newStatus = mapMidtransStatus(status.transactionStatus, status.fraudStatus);
    } else {
      // DEV simulasi: tanpa server key, pakai simulate_status.
      newStatus = body.simulate_status === "success" ? "success" : "failed";
    }

    // Idempotensi: kalau sudah success, jangan proses lagi.
    if (payment.status === "success") {
      return ok({ status: "ok", message: "Sudah diproses" });
    }

    await db.payment.update({
      where: { id: payment.id },
      data: { status: newStatus },
    });

    // Upgrade tier user bila pembayaran sukses.
    if (newStatus === "success") {
      await db.user.update({
        where: { id: payment.userId },
        data: usageFieldsForTier(payment.tierPurchased),
      });
    }

    return ok({ status: "ok", paymentStatus: newStatus });
  } catch (error) {
    return handleError(error);
  }
}
