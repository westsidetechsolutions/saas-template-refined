import payload from 'payload'
import { getBillingWindow, getEntitlements, enforceLimit, incUsage, hashKey } from '../usage'

export async function requireApiKey(req: Request) {
  const auth = req.headers.get('authorization') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : null
  if (!token) return { ok: false, status: 401, error: 'missing_api_key' }

  // Never store raw tokens; hash and lookup
  const hash = hashKey(token)
  const res = await payload.find({
    collection: 'api_keys',
    where: { and: [{ keyHash: { equals: hash } }, { revokedAt: { exists: false } }] },
    limit: 1,
    depth: 1,
  })
  const key = res.docs[0]
  if (!key) return { ok: false, status: 401, error: 'invalid_api_key' }

  const user = key.user // populated by depth:1
  if (!user) return { ok: false, status: 401, error: 'invalid_api_key_owner' }

  // Load current usage and entitlements
  const { periodStart, periodEnd } = getBillingWindow(user)
  const usageDoc = await payload
    .find({
      collection: 'usage',
      where: {
        and: [
          { user: { equals: user.id } },
          { periodStart: { equals: periodStart.toISOString() } },
          { periodEnd: { equals: periodEnd.toISOString() } },
        ],
      },
      limit: 1,
      depth: 0,
    })
    .then((r) => r.docs[0])

  const ents = getEntitlements(user.planPriceId)
  const check = await enforceLimit({ user, usageDoc, field: 'apiCalls' as const })
  if (!check.ok) return { ok: false, status: 429, error: 'api_limit_reached' }

  // Increment usage (1 apiCall)
  await incUsage(user.id, 'apiCalls', 1)

  return { ok: true, user, usageDoc, entitlements: ents }
}
