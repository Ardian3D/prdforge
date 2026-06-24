// Client-side fetch wrapper untuk API internal PRDForge.
// Cookie auth (httpOnly) dikirim otomatis via credentials: "include".

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiFailure {
  success: false;
  error: { message: string; code?: string; [k: string]: unknown };
}

export class ApiClientError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(path, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  let body: ApiSuccess<T> | ApiFailure | null = null;
  try {
    body = (await res.json()) as ApiSuccess<T> | ApiFailure;
  } catch {
    // respons non-JSON
  }

  if (!res.ok || !body || body.success === false) {
    const message =
      body && body.success === false
        ? body.error?.message
        : `Permintaan gagal (${res.status})`;
    const code = body && body.success === false ? body.error?.code : undefined;
    throw new ApiClientError(message ?? "Terjadi kesalahan", res.status, code);
  }

  return body.data;
}
