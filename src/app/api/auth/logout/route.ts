import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/server/cookies";

export async function POST() {
  const res = NextResponse.json({ success: true, data: { loggedOut: true } });
  clearAuthCookie(res);
  return res;
}
