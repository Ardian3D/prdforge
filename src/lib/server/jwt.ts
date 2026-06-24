import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { env } from "./env";

// jose bekerja di Node maupun Edge runtime (dipakai juga di middleware).

export interface AuthTokenPayload extends JWTPayload {
  sub: string; // user id
  email: string;
  role: "user" | "admin";
  tier: "free" | "starter" | "pro" | "probundle";
}

export interface AuthTokenClaims {
  sub: string;
  email: string;
  role: "user" | "admin";
  tier: "free" | "starter" | "pro" | "probundle";
}

function getSecretKey(): Uint8Array {
  return new TextEncoder().encode(env.jwtSecret);
}

export async function signToken(claims: AuthTokenClaims): Promise<string> {
  const expiresIn = env.jwtExpiresIn; // detik
  return new SignJWT({
    email: claims.email,
    role: claims.role,
    tier: claims.tier,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + expiresIn)
    .setSubject(claims.sub)
    .sign(getSecretKey());
}

export async function verifyToken(
  token: string
): Promise<AuthTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: ["HS256"],
    });
    return payload as AuthTokenPayload;
  } catch {
    return null;
  }
}

export const AUTH_COOKIE = "prdforge_token";
