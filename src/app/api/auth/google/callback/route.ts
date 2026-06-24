import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { env } from "@/lib/server/env";
import { signToken } from "@/lib/server/jwt";
import { setAuthCookie } from "@/lib/server/cookies";
import { usageFieldsForTier } from "@/lib/server/usage";
import { getClientIp, getIpSubnet } from "@/lib/server/fraud";

function loginError(reason: string) {
  const url = new URL("/auth/login", env.appUrl);
  url.searchParams.set("error", reason);
  return NextResponse.redirect(url);
}

// GET /api/auth/google/callback — tukar code, upsert user, set cookie, redirect.
export async function GET(req: NextRequest) {
  if (!env.googleConfigured) return loginError("google_not_configured");

  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const cookieState = req.cookies.get("g_oauth_state")?.value;

  if (!code || !state || state !== cookieState) {
    return loginError("google_state_mismatch");
  }

  const redirectPath = decodeURIComponent(state.split(":")[1] || "/dashboard");

  try {
    // 1) Tukar authorization code → access token.
    const tokenResp = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: env.googleClientId,
        client_secret: env.googleClientSecret,
        redirect_uri: env.googleRedirectUri,
        grant_type: "authorization_code",
      }),
    });
    if (!tokenResp.ok) return loginError("google_token_failed");
    const tokenData = (await tokenResp.json()) as { access_token?: string };
    if (!tokenData.access_token) return loginError("google_token_failed");

    // 2) Ambil profil user.
    const profileResp = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
    );
    if (!profileResp.ok) return loginError("google_profile_failed");
    const profile = (await profileResp.json()) as {
      id: string;
      email: string;
      name?: string;
      verified_email?: boolean;
    };
    if (!profile.email) return loginError("google_no_email");

    const email = profile.email.toLowerCase();
    const ip = getClientIp(req);

    // 3) Upsert user (provider google).
    const existing = await db.user.findUnique({ where: { email } });
    let user;
    if (existing) {
      if (existing.isBanned) return loginError("user_banned");
      user = await db.user.update({
        where: { id: existing.id },
        data: {
          googleId: existing.googleId ?? profile.id,
          provider: existing.passwordHash ? existing.provider : "google",
          name: existing.name ?? profile.name ?? null,
          lastIp: ip,
          lastIpSubnet: getIpSubnet(ip),
        },
      });
    } else {
      user = await db.user.create({
        data: {
          email,
          name: profile.name ?? null,
          provider: "google",
          googleId: profile.id,
          ...usageFieldsForTier("free"),
          lastIp: ip,
          lastIpSubnet: getIpSubnet(ip),
        },
      });
    }

    // 4) Sign JWT + set cookie + redirect.
    const token = await signToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      tier: user.tier,
    });
    const dest = user.role === "admin" ? "/admin" : redirectPath;
    const res = NextResponse.redirect(new URL(dest, env.appUrl));
    setAuthCookie(res, token, env.jwtExpiresIn);
    res.cookies.set("g_oauth_state", "", { path: "/", maxAge: 0 });
    return res;
  } catch {
    return loginError("google_error");
  }
}
