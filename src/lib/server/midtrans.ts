import crypto from "node:crypto";
import { env } from "./env";
import { ApiError } from "./http";
import type { PaymentStatus } from "@prisma/client";

/**
 * Helper terpusat untuk integrasi Midtrans (Snap + Core API status).
 *
 * KEBIJAKAN BIAYA VA = "MERCHANT PAYS":
 * Customer dikenakan PERSIS harga tier (gross_amount = harga tier), tanpa
 * surcharge biaya admin VA. Biaya admin VA ditanggung merchant (dipotong dari
 * settlement). Pengaturan "siapa menanggung fee" untuk VA diatur di Midtrans
 * Dashboard (Settings → Configuration), bukan via API — kode ini cukup
 * memastikan TIDAK menambahkan biaya apa pun ke tagihan customer.
 */

export function midtransConfigured(): boolean {
  return Boolean(env.midtransServerKey);
}

function snapBaseUrl(): string {
  return env.midtransIsProduction
    ? "https://app.midtrans.com/snap/v1/transactions"
    : "https://app.sandbox.midtrans.com/snap/v1/transactions";
}

function coreApiBaseUrl(): string {
  return env.midtransIsProduction
    ? "https://api.midtrans.com"
    : "https://api.sandbox.midtrans.com";
}

function authHeader(): string {
  // Basic auth: base64(serverKey + ":")
  return `Basic ${Buffer.from(`${env.midtransServerKey}:`).toString("base64")}`;
}

// Channel pembayaran yang diaktifkan. VA (bank transfer) didahulukan sesuai
// kebijakan; e-wallet & QRIS tetap tersedia untuk kenyamanan customer.
const ENABLED_PAYMENTS = [
  "bca_va",
  "bni_va",
  "bri_va",
  "cimb_va",
  "permata_va",
  "other_va",
  "echannel", // Mandiri Bill
  "gopay",
  "shopeepay",
  "qris",
];

export interface SnapItem {
  id: string;
  price: number;
  quantity: number;
  name: string;
}

export interface CreateSnapParams {
  orderId: string;
  grossAmount: number; // = harga tier, TANPA surcharge (Merchant Pays)
  customer: { email: string; name?: string | null };
  item: SnapItem;
  finishUrl: string;
  expiryMinutes?: number;
}

export interface SnapResult {
  token: string;
  redirectUrl: string;
}

/** Buat transaksi Snap. gross_amount HARUS sama dengan total item_details. */
export async function createSnapTransaction(
  params: CreateSnapParams
): Promise<SnapResult> {
  const { orderId, grossAmount, customer, item, finishUrl } = params;
  const expiryMinutes = params.expiryMinutes ?? 60;

  const resp = await fetch(snapBaseUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: authHeader(),
    },
    body: JSON.stringify({
      transaction_details: {
        order_id: orderId,
        // Tanpa biaya admin VA — customer bayar persis harga tier.
        gross_amount: grossAmount,
      },
      item_details: [item],
      customer_details: {
        email: customer.email,
        first_name: customer.name ?? "User",
      },
      enabled_payments: ENABLED_PAYMENTS,
      // Kembali ke halaman billing setelah pembayaran selesai.
      callbacks: { finish: finishUrl },
      expiry: { unit: "minutes", duration: expiryMinutes },
      custom_field1: item.id, // tier
    }),
  });

  if (!resp.ok) {
    const detail = await resp.text().catch(() => "");
    console.error("[midtrans] snap create failed:", resp.status, detail.slice(0, 300));
    throw new ApiError("Gagal membuat transaksi Midtrans", 502, "GATEWAY_ERROR");
  }

  const data = (await resp.json()) as { token?: string; redirect_url?: string };
  if (!data.redirect_url || !data.token) {
    throw new ApiError("Respons Midtrans tidak lengkap", 502, "GATEWAY_ERROR");
  }
  return { token: data.token, redirectUrl: data.redirect_url };
}

/**
 * Verifikasi signature notifikasi Midtrans.
 * signature = sha512(order_id + status_code + gross_amount + serverKey)
 */
export function verifyNotificationSignature(input: {
  orderId: string;
  statusCode: string;
  grossAmount: string;
  signatureKey: string;
}): boolean {
  const expected = crypto
    .createHash("sha512")
    .update(
      `${input.orderId}${input.statusCode}${input.grossAmount}${env.midtransServerKey}`
    )
    .digest("hex");
  // Bandingkan secara aman terhadap timing attack.
  const a = Buffer.from(expected);
  const b = Buffer.from(input.signatureKey || "");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export interface MidtransStatus {
  transactionStatus?: string;
  fraudStatus?: string;
  statusCode?: string;
  grossAmount?: string;
  paymentType?: string;
}

/**
 * Ambil status transaksi LANGSUNG dari Midtrans (source of truth).
 * Best practice: jangan hanya percaya payload webhook — konfirmasi ke server.
 */
export async function fetchTransactionStatus(
  orderId: string
): Promise<MidtransStatus> {
  const resp = await fetch(`${coreApiBaseUrl()}/v2/${encodeURIComponent(orderId)}/status`, {
    method: "GET",
    headers: { Accept: "application/json", Authorization: authHeader() },
  });
  if (!resp.ok) {
    const detail = await resp.text().catch(() => "");
    console.error("[midtrans] status fetch failed:", resp.status, detail.slice(0, 300));
    throw new ApiError("Gagal memeriksa status transaksi", 502, "GATEWAY_ERROR");
  }
  const d = (await resp.json()) as {
    transaction_status?: string;
    fraud_status?: string;
    status_code?: string;
    gross_amount?: string;
    payment_type?: string;
  };
  return {
    transactionStatus: d.transaction_status,
    fraudStatus: d.fraud_status,
    statusCode: d.status_code,
    grossAmount: d.gross_amount,
    paymentType: d.payment_type,
  };
}

/** Map status transaksi Midtrans → status pembayaran internal. */
export function mapMidtransStatus(
  transactionStatus?: string,
  fraudStatus?: string
): PaymentStatus {
  switch (transactionStatus) {
    case "capture":
      // Untuk kartu: capture + accept = sukses; challenge = masih pending.
      return fraudStatus === "challenge" ? "pending" : "success";
    case "settlement":
      return "success";
    case "deny":
    case "cancel":
    case "expire":
      return "failed";
    case "refund":
    case "partial_refund":
      return "refunded";
    case "pending":
    default:
      return "pending";
  }
}
