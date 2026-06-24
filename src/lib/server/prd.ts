import type { User } from "@prisma/client";
import { db } from "./db";
import { ApiError } from "./http";
import { isUnlimited } from "./tiers";
import type { PrdSection } from "./deepseek";

// Bentuk konten PRD yang disimpan di kolom Prd.content (JSON).
export interface PrdContent {
  sections: PrdSection[];
}

// Ambil PRD milik user; lempar 404 bila bukan miliknya / tidak ada.
export async function getOwnedPrd(prdId: string, userId: string) {
  const prd = await db.prd.findUnique({ where: { id: prdId } });
  if (!prd || prd.userId !== userId) {
    throw new ApiError("PRD tidak ditemukan", 404, "PRD_NOT_FOUND");
  }
  return prd;
}

// Gabungkan section hasil revisi ke daftar section (match by title).
export function mergeSections(
  current: PrdSection[],
  updates: PrdSection[]
): PrdSection[] {
  const map = new Map(current.map((s) => [s.title.toLowerCase(), { ...s }]));
  for (const u of updates) {
    const key = u.title.toLowerCase();
    if (map.has(key)) {
      map.get(key)!.content = u.content;
    } else {
      map.set(key, { ...u });
    }
  }
  // Pertahankan urutan section awal, lalu section baru di akhir.
  const ordered: PrdSection[] = current.map(
    (s) => map.get(s.title.toLowerCase())!
  );
  for (const u of updates) {
    if (!current.some((s) => s.title.toLowerCase() === u.title.toLowerCase())) {
      ordered.push(map.get(u.title.toLowerCase())!);
    }
  }
  return ordered;
}

/**
 * Kurangi 1 kuota generate secara atomik. Unlimited (-1) dilewati.
 * Lempar ApiError 402 bila kuota habis.
 */
export async function consumeGeneration(user: User): Promise<void> {
  if (isUnlimited(user.generationCount)) return;
  const result = await db.user.updateMany({
    where: { id: user.id, generationCount: { gt: 0 } },
    data: { generationCount: { decrement: 1 } },
  });
  if (result.count === 0) {
    throw new ApiError(
      "Kuota generate PRD sudah habis. Upgrade paket untuk lanjut.",
      402,
      "QUOTA_EXHAUSTED"
    );
  }
}

export async function consumeRevision(user: User): Promise<void> {
  if (isUnlimited(user.revisionCount)) return;
  const result = await db.user.updateMany({
    where: { id: user.id, revisionCount: { gt: 0 } },
    data: { revisionCount: { decrement: 1 } },
  });
  if (result.count === 0) {
    throw new ApiError(
      "Kuota revisi chat sudah habis. Upgrade paket untuk lanjut.",
      402,
      "QUOTA_EXHAUSTED"
    );
  }
}

// Kembalikan kuota (mis. bila generate gagal setelah konsumsi).
export async function refundGeneration(user: User): Promise<void> {
  if (isUnlimited(user.generationCount)) return;
  await db.user.update({
    where: { id: user.id },
    data: { generationCount: { increment: 1 } },
  });
}

export async function refundRevision(user: User): Promise<void> {
  if (isUnlimited(user.revisionCount)) return;
  await db.user.update({
    where: { id: user.id },
    data: { revisionCount: { increment: 1 } },
  });
}

// Render PRD ke Markdown lengkap (untuk export).
export function prdToMarkdown(title: string, sections: PrdSection[]): string {
  const header = `# ${title}\n\n`;
  const body = sections
    .map((s, i) => `## ${i + 1}. ${s.title}\n\n${s.content}\n`)
    .join("\n");
  return header + body;
}
