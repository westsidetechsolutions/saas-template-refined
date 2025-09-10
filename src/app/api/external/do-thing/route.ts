import { NextResponse } from 'next/server'
import { requireApiKey } from '@/lib/api/requireApiKey'

export async function POST(req: Request) {
  const auth = await requireApiKey(req)
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  // ... do work ...
  const body = await req.json().catch(() => ({}))

  return NextResponse.json({
    ok: true,
    message: 'Action completed successfully',
    usage: {
      apiCalls: auth.usageDoc?.apiCalls || 0,
      remaining: auth.entitlements.maxApiCalls
        ? auth.entitlements.maxApiCalls - (auth.usageDoc?.apiCalls || 0)
        : Infinity,
    },
  })
}
