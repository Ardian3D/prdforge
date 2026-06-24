import type { NextRequest } from "next/server";
import type { User } from "@prisma/client";
import { db } from "./db";
import { verifyToken, AUTH_COOKIE, type AuthTokenPayload } from "./jwt";
import { ApiError, handleError } from "./http";

export interface AuthContext {
  user: User;
  payload: AuthTokenPayload;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RouteCtx = { params: Promise<any> };

type Handler = (req: NextRequest, ctx: RouteCtx) => Promise<Response> | Response;
type AuthedHandler = (
  req: NextRequest,
  ctx: RouteCtx,
  auth: AuthContext
) => Promise<Response> | Response;

export function getTokenFromRequest(req: NextRequest): string | null {
  const cookieToken = req.cookies.get(AUTH_COOKIE)?.value;
  if (cookieToken) return cookieToken;
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) return authHeader.slice(7);
  return null;
}

/** Verifikasi token + ambil user dari DB. Lempar ApiError bila gagal. */
export async function requireUser(req: NextRequest): Promise<AuthContext> {
  const token = getTokenFromRequest(req);
  if (!token) {
    throw new ApiError("Tidak terautentikasi", 401, "UNAUTHENTICATED");
  }
  const payload = await verifyToken(token);
  if (!payload?.sub) {
    throw new ApiError("Token tidak valid atau kedaluwarsa", 401, "INVALID_TOKEN");
  }
  const user = await db.user.findUnique({ where: { id: payload.sub } });
  if (!user) {
    throw new ApiError("User tidak ditemukan", 401, "USER_NOT_FOUND");
  }
  if (user.isBanned) {
    throw new ApiError(
      user.banReason || "Akun Anda telah diblokir",
      403,
      "USER_BANNED"
    );
  }
  return { user, payload };
}

/** Wrapper route handler yang butuh login. */
export function withAuth(handler: AuthedHandler): Handler {
  return async (req, ctx) => {
    try {
      const auth = await requireUser(req);
      return await handler(req, ctx, auth);
    } catch (error) {
      return handleError(error);
    }
  };
}

/** Wrapper route handler yang butuh role admin. */
export function withAdmin(handler: AuthedHandler): Handler {
  return async (req, ctx) => {
    try {
      const auth = await requireUser(req);
      if (auth.user.role !== "admin") {
        throw new ApiError("Akses khusus admin", 403, "FORBIDDEN");
      }
      return await handler(req, ctx, auth);
    } catch (error) {
      return handleError(error);
    }
  };
}

// Bentuk user yang aman dikirim ke client (tanpa password hash).
export function sanitizeUser(user: User) {
  const {
    passwordHash: _passwordHash,
    deviceFingerprintHash: _fp,
    lastIp: _ip,
    lastIpSubnet: _subnet,
    ...safe
  } = user;
  void _passwordHash;
  void _fp;
  void _ip;
  void _subnet;
  return safe;
}
