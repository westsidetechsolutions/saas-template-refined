import payload from 'payload'
import { NextResponse } from 'next/server'
import { getOrCreateCurrentUsage, getBillingWindow } from '@/lib/usage'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const periodStart = searchParams.get('periodStart')
    const periodEnd = searchParams.get('periodEnd')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Verify user exists
    const user = await payload.findByID({ collection: 'users', id: userId, depth: 0 })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let startDate: Date, endDate: Date

    if (periodStart && periodEnd) {
      startDate = new Date(periodStart)
      endDate = new Date(periodEnd)
    } else {
      // Fallback to calculating billing window
      const window = getBillingWindow(user as any)
      startDate = window.periodStart
      endDate = window.periodEnd
    }

    // Get or create usage document for this period
    const usage = await getOrCreateCurrentUsage(userId, startDate, endDate)

    return NextResponse.json({
      usage: {
        apiCalls: usage.apiCalls || 0,
        itemsCreated: usage.itemsCreated || 0,
        storageMb: usage.storageMb || 0,
        periodStart: usage.periodStart,
        periodEnd: usage.periodEnd,
        lastUpdatedAt: usage.lastUpdatedAt,
      },
    })
  } catch (error) {
    console.error('Usage current error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
