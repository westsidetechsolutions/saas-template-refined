export type Entitlements = {
  maxItems?: number
  maxApiCalls?: number
  maxStorageMb?: number
  softOveragePercent?: number // e.g. warn at 0.8
}

export const PLAN_ENTITLEMENTS: Record<string, Entitlements> = {
  // keys are Stripe price IDs or internal plan slugs
  price_free: { maxItems: 100, maxApiCalls: 1000, maxStorageMb: 100, softOveragePercent: 0.8 },
  price_pro_monthly: {
    maxItems: 5000,
    maxApiCalls: 100000,
    maxStorageMb: 1000,
    softOveragePercent: 0.8,
  },
  price_pro_yearly: {
    maxItems: 5000,
    maxApiCalls: 100000,
    maxStorageMb: 1000,
    softOveragePercent: 0.8,
  },
  price_enterprise: {
    maxItems: 50000,
    maxApiCalls: 1000000,
    maxStorageMb: 10000,
    softOveragePercent: 0.9,
  },
  // add more as needed
}

export function getEntitlements(planPriceId?: string): Entitlements {
  if (!planPriceId) return PLAN_ENTITLEMENTS['price_free']
  return PLAN_ENTITLEMENTS[planPriceId] ?? PLAN_ENTITLEMENTS['price_free']
}
