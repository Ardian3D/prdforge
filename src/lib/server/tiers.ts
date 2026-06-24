import type { Tier } from "@prisma/client";

// Konfigurasi tier sesuai PRD section 6 & 15.
// Nilai kuota -1 berarti UNLIMITED. resetPeriod menentukan apakah kuota
// di-reset bulanan (paid) atau seumur hidup (free).

export interface TierConfig {
  key: Tier;
  name: string;
  priceMonthly: number; // Rupiah
  generationQuota: number; // -1 = unlimited
  revisionQuota: number; // -1 = unlimited
  resetPeriod: "lifetime" | "monthly";
  canExport: boolean;
  premiumModel: boolean;
  rateLimitPerMinute: number; // NFR section 15
}

export const TIER_CONFIG: Record<Tier, TierConfig> = {
  free: {
    key: "free",
    name: "Free",
    priceMonthly: 0,
    generationQuota: 3,
    revisionQuota: 3,
    resetPeriod: "lifetime",
    canExport: false,
    premiumModel: false,
    rateLimitPerMinute: 10,
  },
  starter: {
    key: "starter",
    name: "Starter",
    priceMonthly: 75000,
    generationQuota: 5,
    revisionQuota: 100,
    resetPeriod: "monthly",
    canExport: true,
    premiumModel: true,
    rateLimitPerMinute: 30,
  },
  pro: {
    key: "pro",
    name: "Pro",
    priceMonthly: 149000,
    generationQuota: -1,
    revisionQuota: -1,
    resetPeriod: "monthly",
    canExport: true,
    premiumModel: true,
    rateLimitPerMinute: 60,
  },
  probundle: {
    key: "probundle",
    name: "Pro Bundle",
    priceMonthly: 199000,
    generationQuota: -1,
    revisionQuota: -1,
    resetPeriod: "monthly",
    canExport: true,
    premiumModel: true,
    rateLimitPerMinute: 60,
  },
};

export function getTierConfig(tier: Tier): TierConfig {
  return TIER_CONFIG[tier];
}

export const PAID_TIERS: Tier[] = ["starter", "pro", "probundle"];

export function isPaidTier(tier: Tier): boolean {
  return PAID_TIERS.includes(tier);
}

export function isUnlimited(quota: number): boolean {
  return quota === -1;
}
