import type { NextResponse } from "next/server";
import { AUTH_COOKIE } from "./jwt";

const isProd = process.env.NODE_ENV === "production";

export function setAuthCookie(
  res: NextResponse,
  token: string,
  maxAgeSec: number
) {
  res.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeSec,
  });
  return res;
}

export function clearAuthCookie(res: NextResponse) {
  res.cookies.set(AUTH_COOKIE, "", {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
