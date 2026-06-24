import { NextResponse, type NextRequest } from "next/server";
import { verifyToken, AUTH_COOKIE } from "@/lib/server/jwt";

// Proteksi navigasi halaman (Next 16: konvensi "proxy" menggantikan "middleware").
// Hanya memakai jose (edge-compatible) — TIDAK mengakses database di sini.
// Validasi mendalam (banned, dll) dilakukan di route handler API via withAuth/withAdmin.

const PROTECTED_PREFIXES = ["/dashboard", "/editor"];
const ADMIN_PREFIXES = ["/admin"];
const AUTH_PAGES = ["/auth/login", "/auth/register"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(AUTH_COOKIE)?.value;
  const payload = token ? await verifyToken(token) : null;
  const isAuthed = Boolean(payload?.sub);

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAdminArea = ADMIN_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));

  // Belum login → blokir area terproteksi.
  if ((isProtected || isAdminArea) && !isAuthed) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Area admin → wajib role admin.
  if (isAdminArea && payload?.role !== "admin") {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Sudah login → jangan biarkan buka halaman login/register lagi.
  if (isAuthPage && isAuthed) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/editor/:path*",
    "/admin/:path*",
    "/auth/login",
    "/auth/register",
  ],
};
