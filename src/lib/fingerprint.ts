// Device fingerprint ringan (fallback). PRD menyarankan FingerprintJS Pro untuk
// akurasi tinggi; ini cukup untuk anti-abuse dasar di sisi client.

const STORAGE_KEY = "prdforge-device-id";

function djb2(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
}

export function getDeviceFingerprint(): string {
  if (typeof window === "undefined") return "ssr";

  // Cache di localStorage agar stabil antar sesi.
  const cached = window.localStorage.getItem(STORAGE_KEY);
  if (cached) return cached;

  const nav = window.navigator;
  const screen = window.screen;
  const signals = [
    nav.userAgent,
    nav.language,
    (nav.languages ?? []).join(","),
    String(nav.hardwareConcurrency ?? ""),
    // @ts-expect-error deviceMemory non-standar
    String(nav.deviceMemory ?? ""),
    `${screen.width}x${screen.height}x${screen.colorDepth}`,
    Intl.DateTimeFormat().resolvedOptions().timeZone ?? "",
  ].join("|");

  const fp = `${djb2(signals)}-${djb2(signals.split("").reverse().join(""))}`;
  window.localStorage.setItem(STORAGE_KEY, fp);
  return fp;
}
