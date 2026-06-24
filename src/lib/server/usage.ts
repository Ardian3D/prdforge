import type { Tier, User } from "@prisma/client";
import { db } from "./db";
import { getTierConfig, isUnlimited } from "./tiers";

// Tanggal 1 bulan berikutnya pukul 00:00 (untuk reset kuota bulanan — US-09).
export function nextMonthlyReset(from = new Date()): Date {
  return new Date(from.getFullYear(), from.getMonth() + 1, 1, 0, 0, 0, 0);
}

// Masa berlaku tier berbayar: 1 bulan dari sekarang.
export function tierExpiry(from = new Date()): Date {
  return new Date(from.getFullYear(), from.getMonth() + 1, from.getDate());
}

// Field kuota awal untuk sebuah tier (dipakai saat register & upgrade).
export function usageFieldsForTier(tier: Tier, now = new Date()) {
  const config = getTierConfig(tier);
  return {
    tier,
    generationCount: config.generationQuota,
    revisionCount: config.revisionQuota,
    usageResetAt: config.resetPeriod === "monthly" ? nextMonthlyReset(now) : null,
    tierExpiresAt: config.priceMonthly > 0 ? tierExpiry(now) : null,
  };
}

/**
 * Reset kuota bila sudah lewat tanggal reset (paid tier, bulanan).
 * Untuk tier free (lifetime) tidak pernah di-reset.
 * Mengembalikan user terbaru (sudah ter-update bila perlu).
 */
export async function maybeResetUsage(user: User): Promise<User> {
  const config = getTierConfig(user.tier);
  if (config.resetPeriod !== "monthly") return user;

  const now = new Date();

  // Tier berbayar yang sudah kedaluwarsa → turunkan ke free.
  if (user.tierExpiresAt && user.tierExpiresAt <= now) {
    return db.user.update({
      where: { id: user.id },
      data: usageFieldsForTier("free", now),
    });
  }

  // Reset kuota bulanan.
  if (user.usageResetAt && user.usageResetAt <= now) {
    return db.user.update({
      where: { id: user.id },
      data: {
        generationCount: config.generationQuota,
        revisionCount: config.revisionQuota,
        usageResetAt: nextMonthlyReset(now),
      },
    });
  }

  return user;
}

// Ringkasan kuota untuk dikirim ke client (/api/users/me).
export function usageSummary(user: User) {
  const config = getTierConfig(user.tier);
  return {
    tier: user.tier,
    generation: {
      remaining: user.generationCount,
      quota: config.generationQuota,
      unlimited: isUnlimited(config.generationQuota),
    },
    revision: {
      remaining: user.revisionCount,
      quota: config.revisionQuota,
      unlimited: isUnlimited(config.revisionQuota),
    },
    canExport: config.canExport,
    premiumModel: config.premiumModel,
    resetAt: user.usageResetAt,
    tierExpiresAt: user.tierExpiresAt,
  };
}
