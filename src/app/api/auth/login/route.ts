import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/server/db";
import { verifyPassword } from "@/lib/server/password";
import { signToken } from "@/lib/server/jwt";
import { env } from "@/lib/server/env";
import { setAuthCookie } from "@/lib/server/cookies";
import { sanitizeUser } from "@/lib/server/auth";
import { ApiError, handleError } from "@/lib/server/http";
import { rateLimit } from "@/lib/server/rate-limit";
import { getClientIp, getIpSubnet } from "@/lib/server/fraud";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi").max(128),
});

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);

    // Rate limit anti brute-force per IP.
    const rl = rateLimit(`login:${ip}`, 10, 60_000);
    if (!rl.success) {
      throw new ApiError(
        "Terlalu banyak percobaan login. Coba lagi nanti.",
        429,
        "RATE_LIMITED"
      );
    }

    const json = await req.json().catch(() => null);
    const parsed = loginSchema.safeParse(json);
    if (!parsed.success) {
      throw new ApiError(
        parsed.error.issues[0]?.message ?? "Input tidak valid",
        422,
        "VALIDATION_ERROR"
      );
    }
    const { email, password } = parsed.data;

    const user = await db.user.findUnique({ where: { email } });
    // Pesan generik agar tidak membocorkan keberadaan email.
    const invalid = () =>
      new ApiError("Email atau password salah", 401, "INVALID_CREDENTIALS");

    if (!user || !user.passwordHash) throw invalid();
    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) throw invalid();

    if (user.isBanned) {
      throw new ApiError(
        user.banReason || "Akun Anda telah diblokir",
        403,
        "USER_BANNED"
      );
    }

    // Update jejak IP terakhir.
    const updated = await db.user.update({
      where: { id: user.id },
      data: { lastIp: ip, lastIpSubnet: getIpSubnet(ip) },
    });

    const token = await signToken({
      sub: updated.id,
      email: updated.email,
      role: updated.role,
      tier: updated.tier,
    });

    const res = NextResponse.json({
      success: true,
      data: { user: sanitizeUser(updated) },
    });
    setAuthCookie(res, token, env.jwtExpiresIn);
    return res;
  } catch (error) {
    return handleError(error);
  }
}
