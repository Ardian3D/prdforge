import { NextResponse } from "next/server";

// Helper response API yang konsisten.

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ success: true, data }, init);
}

export function created<T>(data: T) {
  return NextResponse.json({ success: true, data }, { status: 201 });
}

export function fail(
  message: string,
  status = 400,
  code?: string,
  extra?: Record<string, unknown>
) {
  return NextResponse.json(
    { success: false, error: { message, code, ...extra } },
    { status }
  );
}

// Error domain yang bisa dilempar dari service lalu ditangkap handler.
export class ApiError extends Error {
  status: number;
  code?: string;
  extra?: Record<string, unknown>;

  constructor(
    message: string,
    status = 400,
    code?: string,
    extra?: Record<string, unknown>
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.extra = extra;
  }
}

// Bungkus handler untuk menangkap ApiError & error tak terduga.
export function handleError(error: unknown) {
  if (error instanceof ApiError) {
    return fail(error.message, error.status, error.code, error.extra);
  }
  console.error("[API ERROR]", error);
  return fail("Terjadi kesalahan pada server", 500, "INTERNAL_ERROR");
}
