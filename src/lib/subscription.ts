/**
 * Utility functions for checking subscription status
 */

export interface SubscriptionCheckResult {
  hasActiveSubscription: boolean
  subscriptionStatus?: string
  subscriptionCurrentPeriodEnd?: string
  isActive: boolean
  isCanceledButActive: boolean
  currentPeriodEnd?: Date
}

/**
 * Check if a user has an active subscription
 * @param user - The user object from Payload CMS
 * @returns SubscriptionCheckResult with detailed subscription information
 */
export function checkUserSubscription(user: any): SubscriptionCheckResult {
  try {
    const now = new Date()
    const currentPeriodEnd = user.subscriptionCurrentPeriodEnd
      ? new Date(user.subscriptionCurrentPeriodEnd)
      : undefined

    // Check if subscription is active or trialing
    const isActive = user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trialing'

    // Check if subscription is canceled but still within the current period
    const isCanceledButActive =
      user.subscriptionStatus === 'canceled' && currentPeriodEnd && currentPeriodEnd > now

    const hasActiveSubscription = Boolean(isActive || isCanceledButActive)

    return {
      hasActiveSubscription,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionCurrentPeriodEnd: user.subscriptionCurrentPeriodEnd,
      isActive,
      isCanceledButActive,
      currentPeriodEnd,
    }
  } catch (error) {
    console.error('Error checking user subscription:', error)
    return {
      hasActiveSubscription: false,
      isActive: false,
      isCanceledButActive: false,
    }
  }
}

/**
 * Check if a user can access premium features
 * @param user - The user object from Payload CMS
 * @returns boolean indicating if user can access premium features
 */
export function canAccessPremiumFeatures(user: any): boolean {
  const subscriptionCheck = checkUserSubscription(user)
  return subscriptionCheck.hasActiveSubscription
}

/**
 * Get subscription status for display purposes
 * @param user - The user object from Payload CMS
 * @returns string describing the subscription status
 */
export function getSubscriptionStatus(user: any): string {
  const subscriptionCheck = checkUserSubscription(user)

  if (subscriptionCheck.hasActiveSubscription) {
    if (subscriptionCheck.isActive) {
      return subscriptionCheck.subscriptionStatus === 'trialing' ? 'Trial' : 'Active'
    } else if (subscriptionCheck.isCanceledButActive) {
      return 'Active (Canceled)'
    }
  }

  return 'Inactive'
}
