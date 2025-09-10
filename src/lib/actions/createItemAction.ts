import payload from 'payload'
import {
  getBillingWindow,
  getEntitlements,
  enforceLimit,
  incUsage,
  getOrCreateCurrentUsage,
} from '@/lib/usage'

export async function createItemAction(userId: string, data: any) {
  try {
    const user = await payload.findByID({ collection: 'users', id: userId, depth: 0 })
    if (!user) {
      throw new Error('User not found')
    }

    const { periodStart, periodEnd } = getBillingWindow(user)
    const usageDoc = await getOrCreateCurrentUsage(user.id, periodStart, periodEnd)
    const check = await enforceLimit({ user, usageDoc, field: 'itemsCreated' })

    if (!check.ok) {
      // Return or throw with UX-friendly message
      throw new Error(`You've hit your plan limit (${check.limit} items). Upgrade to continue.`)
    }

    // Create the item (you'll need to replace "items" with your actual collection)
    const item = await payload.create({
      collection: 'media', // Using media as an example - replace with your collection
      data: {
        ...data,
        user: user.id,
      },
    })

    // Increment usage after successful creation
    await incUsage(user.id, 'itemsCreated', 1)

    return {
      success: true,
      item,
      usage: {
        itemsCreated: usageDoc.itemsCreated + 1,
        remaining: check.remaining - 1,
        limit: check.limit,
      },
    }
  } catch (error) {
    console.error('Create item action error:', error)
    throw error
  }
}
