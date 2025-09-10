import payload from 'payload'
import { getEntitlements } from '../billing/entitlements'
import crypto from 'crypto'

export type OrgLike = {
  id: string
  planPriceId?: string
  subscriptionStatus?: 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete'
  subscriptionCurrentPeriodEnd?: string | number | Date // Stripe mirrors
}

export function now() {
  return new Date()
}
export function toDate(v: any) {
  return v instanceof Date ? v : new Date(v)
}

export async function getOrCreateCurrentUsage(userId: string, periodStart: Date, periodEnd: Date) {
  const res = await payload.find({
    collection: 'usage',
    where: {
      and: [
        { user: { equals: userId } },
        { periodStart: { equals: periodStart.toISOString() } },
        { periodEnd: { equals: periodEnd.toISOString() } },
      ],
    },
    limit: 1,
    depth: 0,
  })
  if (res.totalDocs > 0) return res.docs[0]

  const created = await payload.create({
    collection: 'usage',
    data: {
      user: userId,
      periodStart,
      periodEnd,
      apiCalls: 0,
      itemsCreated: 0,
      storageMb: 0,
      lastUpdatedAt: now(),
    },
  })
  return created
}

export function getBillingWindow(user: OrgLike) {
  const end = toDate(user.subscriptionCurrentPeriodEnd ?? now())
  // naive month window fallback if missing
  const periodEnd = isNaN(end.getTime()) ? new Date(Date.now() + 30 * 24 * 3600 * 1000) : end
  const periodStart = new Date(periodEnd.getTime() - 30 * 24 * 3600 * 1000)
  return { periodStart, periodEnd }
}

export async function enforceLimit(opts: {
  user: OrgLike
  usageDoc: any
  field: 'apiCalls' | 'itemsCreated' | 'storageMb'
}) {
  const ents = getEntitlements(opts.user.planPriceId)
  const limit =
    (opts.field === 'apiCalls'
      ? ents.maxApiCalls
      : opts.field === 'itemsCreated'
        ? ents.maxItems
        : ents.maxStorageMb) ?? Infinity

  const current = Number(opts.usageDoc?.[opts.field] ?? 0)
  const ok = current < limit
  const remaining = isFinite(limit) ? Math.max(0, limit - current) : Infinity

  return { ok, remaining, limit }
}

// atomic-ish increment (Payload isn't transactional; do a single update)
export async function incUsage(
  userId: string,
  field: 'apiCalls' | 'itemsCreated' | 'storageMb',
  by = 1,
) {
  // naive: load latest usage for current period and update
  const user = await payload.findByID({ collection: 'users', id: userId, depth: 0 })
  const { periodStart, periodEnd } = getBillingWindow(user)
  const usage = await getOrCreateCurrentUsage(userId, periodStart, periodEnd)
  const next = Number(usage[field] ?? 0) + by

  const updated = await payload.update({
    collection: 'usage',
    id: usage.id,
    data: { [field]: next, lastUpdatedAt: now() },
  })
  return updated
}

// API Key helpers
export function hashKey(raw: string) {
  return crypto.createHash('sha256').update(raw).digest('hex')
}

export function newKey(prefix = 'wsts_live') {
  const raw = `${prefix}_${crypto.randomBytes(24).toString('hex')}`
  const hash = hashKey(raw)
  return { raw, hash }
}
