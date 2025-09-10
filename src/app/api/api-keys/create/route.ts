import payload from 'payload'
import { NextResponse } from 'next/server'
import { newKey } from '@/lib/usage'

export async function POST(req: Request) {
  try {
    // Get user from session (you'll need to implement this based on your auth setup)
    // For now, we'll require a userId in the request body
    const body = await req.json().catch(() => ({}))
    const { name = 'Default key', userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Verify user exists
    const user = await payload.findByID({ collection: 'users', id: userId, depth: 0 })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { raw, hash } = newKey('wsts_live')
    await payload.create({
      collection: 'api_keys',
      data: {
        user: userId,
        name,
        keyHash: hash,
        scopes: ['read', 'write'], // default scopes
      },
    })

    // Return raw key ONCE - user should save it immediately
    return NextResponse.json({
      apiKey: raw,
      message: "API key created successfully. Save this key securely - it won't be shown again.",
    })
  } catch (error) {
    console.error('API key creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
