import { type NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { env } from "@/lib/server/env";

// GET /api/auth/google — redirect ke Google consent screen (US: Google OAuth).
export async function GET(req: NextRequest) {
  if (!env.googleConfigured) {
    const url = new URL("/auth/login", env.appUrl);
    url.searchParams.set("error", "google_not_configured");
    return NextResponse.redirect(url);
  }

  const redirect = req.nextUrl.searchParams.get("redirect") || "/dashboard";
  const state = `${crypto.randomBytes(16).toString("hex")}:${encodeURIComponent(redirect)}`;

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", env.googleClientId);
  authUrl.searchParams.set("redirect_uri", env.googleRedirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "openid email profile");
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("access_type", "offline");
  authUrl.searchParams.set("prompt", "select_account");

  const res = NextResponse.redirect(authUrl.toString());
  res.cookies.set("g_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return res;
}
