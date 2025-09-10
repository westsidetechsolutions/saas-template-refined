import { getPayload } from 'payload'
import config from '@/payload.config'

export interface UserBilling {
  id: string
  email: string
  firstName?: string
  lastName?: string
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  subscriptionStatus?: string
  subscriptionPlan?: string
  subscriptionCurrentPeriodEnd?: string
  planPriceId?: string
  cancelAt?: string
  canceledAt?: string
  trialEnd?: string
  hasUsedTrial?: boolean
  lastPaymentDate?: string
}

export async function getUserBilling(userId: string): Promise<UserBilling> {
  const payload = await getPayload({ config })

  const user = await payload.findByID({
    collection: 'users',
    id: userId,
  })

  if (!user) {
    throw new Error('User not found')
  }

  return user as UserBilling
}

export async function getBillingStatus(userId: string): Promise<{
  hasAccess: boolean
  status: string
  currentPeriodEnd?: string
  isTrialing: boolean
  isPastDue: boolean
  isCanceled: boolean
}> {
  const payload = await getPayload({ config })

  const user = await payload.findByID({
    collection: 'users',
    id: userId,
  })

  if (!user) {
    return {
      hasAccess: false,
      status: 'not_found',
      isTrialing: false,
      isPastDue: false,
      isCanceled: false,
    }
  }

  const now = new Date()
  const currentPeriodEnd = user.subscriptionCurrentPeriodEnd
    ? new Date(user.subscriptionCurrentPeriodEnd)
    : null

  // Check if subscription is active or trialing
  const isActive = user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trialing'
  const isTrialing = user.subscriptionStatus === 'trialing'
  const isPastDue = user.subscriptionStatus === 'past_due'
  const isCanceled = user.subscriptionStatus === 'canceled'

  // If canceled but still within current period, allow access
  const isCanceledButActive = isCanceled && currentPeriodEnd && currentPeriodEnd > now

  // If past due, still allow access (grace period)
  const hasAccess = isActive || isCanceledButActive || isPastDue

  return {
    hasAccess,
    status: user.subscriptionStatus || 'incomplete',
    currentPeriodEnd: user.subscriptionCurrentPeriodEnd,
    isTrialing,
    isPastDue,
    isCanceled,
  }
}
