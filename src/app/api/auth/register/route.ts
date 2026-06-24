import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/server/db";
import { hashPassword } from "@/lib/server/password";
import { signToken } from "@/lib/server/jwt";
import { env } from "@/lib/server/env";
import { setAuthCookie } from "@/lib/server/cookies";
import { sanitizeUser } from "@/lib/server/auth";
import { ApiError, handleError } from "@/lib/server/http";
import { rateLimit } from "@/lib/server/rate-limit";
import {
  getClientIp,
  getIpSubnet,
  hashFingerprint,
} from "@/lib/server/fraud";
import { usageFieldsForTier } from "@/lib/server/usage";

const registerSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  email: z.string().trim().toLowerCase().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter").max(128),
  deviceFingerprint: z.string().min(1).max(256).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);

    // Rate limit pendaftaran per IP (anti-spam).
    const rl = rateLimit(`register:${ip}`, 5, 60_000);
    if (!rl.success) {
      throw new ApiError(
        "Terlalu banyak percobaan. Coba lagi nanti.",
        429,
        "RATE_LIMITED"
      );
    }

    const json = await req.json().catch(() => null);
    const parsed = registerSchema.safeParse(json);
    if (!parsed.success) {
      throw new ApiError(
        parsed.error.issues[0]?.message ?? "Input tidak valid",
        422,
        "VALIDATION_ERROR"
      );
    }
    const { name, email, password, deviceFingerprint } = parsed.data;

    const ipSubnet = getIpSubnet(ip);
    const deviceHash = deviceFingerprint
      ? hashFingerprint(deviceFingerprint, ip)
      : null;

    // --- Anti-fraud: cegah multi-account di device yang sama (US-05) ---
    if (deviceHash) {
      const existingDevice = await db.user.findFirst({
        where: { deviceFingerprintHash: deviceHash },
      });
      if (existingDevice) {
        await db.fraudLog.create({
          data: {
            deviceHash,
            ipAddress: ip,
            ipSubnet,
            emailAttempted: email,
            action: "blocked",
            reason: "Device fingerprint sudah terdaftar (multi-account)",
          },
        });
        throw new ApiError(
          "Free tier sudah digunakan pada perangkat ini.",
          409,
          "DEVICE_ALREADY_USED"
        );
      }
    }

    // Cek email unik.
    const existingEmail = await db.user.findUnique({ where: { email } });
    if (existingEmail) {
      throw new ApiError("Email sudah terdaftar", 409, "EMAIL_TAKEN");
    }

    const passwordHash = await hashPassword(password);
    const user = await db.user.create({
      data: {
        email,
        name: name ?? null,
        passwordHash,
        provider: "email",
        ...usageFieldsForTier("free"),
        deviceFingerprintHash: deviceHash,
        lastIp: ip,
        lastIpSubnet: ipSubnet,
      },
    });

    await db.fraudLog.create({
      data: {
        deviceHash,
        ipAddress: ip,
        ipSubnet,
        emailAttempted: email,
        action: "allowed",
        reason: "Registrasi berhasil",
      },
    });

    const token = await signToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      tier: user.tier,
    });

    const res = NextResponse.json(
      { success: true, data: { user: sanitizeUser(user) } },
      { status: 201 }
    );
    setAuthCookie(res, token, env.jwtExpiresIn);
    return res;
  } catch (error) {
    return handleError(error);
  }
}
