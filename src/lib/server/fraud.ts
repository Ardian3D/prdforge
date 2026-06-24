import crypto from "node:crypto";
import type { NextRequest } from "next/server";

// Anti-abuse helpers (PRD section 7 & US-05).
// Device fingerprint dikirim dari client (FingerprintJS) lalu di-hash + IP subnet.

export function hashFingerprint(fingerprint: string, ip: string): string {
  return crypto
    .createHash("sha256")
    .update(`${fingerprint}:${ip}`)
    .digest("hex");
}

// Ambil IP client dari header proxy (Vercel/Nginx) atau fallback.
export function getClientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "0.0.0.0";
}

// Subnet /24 untuk IPv4, prefix untuk IPv6 — cukup untuk deteksi cluster device.
export function getIpSubnet(ip: string): string {
  if (ip.includes(":")) {
    // IPv6: ambil 4 hextet pertama (/64-ish)
    return ip.split(":").slice(0, 4).join(":");
  }
  const parts = ip.split(".");
  if (parts.length === 4) return `${parts[0]}.${parts[1]}.${parts[2]}.0/24`;
  return ip;
}
