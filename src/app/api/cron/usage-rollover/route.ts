import payload from 'payload'
import { NextResponse } from 'next/server'
import { getBillingWindow, getOrCreateCurrentUsage } from '@/lib/usage'

export async function GET() {
  try {
    // Pull a page of users (iterate/paginate in real job)
    const users = await payload.find({ collection: 'users', limit: 100, depth: 0 })
    let processed = 0

    for (const user of users.docs) {
      const { periodStart, periodEnd } = getBillingWindow(user as any)
      await getOrCreateCurrentUsage(user.id, periodStart, periodEnd)
      processed++
    }

    return NextResponse.json({
      ok: true,
      processed,
      totalUsers: users.totalDocs,
      message: `Processed ${processed} users for usage rollover`,
    })
  } catch (error) {
    console.error('Usage rollover error:', error)
    return NextResponse.json(
      {
        ok: false,
        error: 'Internal server error',
      },
      { status: 500 },
    )
  }
}
