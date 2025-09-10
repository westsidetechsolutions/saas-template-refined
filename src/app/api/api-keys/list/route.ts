import payload from 'payload'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Verify user exists
    const user = await payload.findByID({ collection: 'users', id: userId, depth: 0 })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get user's API keys
    const keys = await payload.find({
      collection: 'api_keys',
      where: { user: { equals: userId } },
      sort: '-createdAt',
      depth: 0,
    })

    return NextResponse.json({
      keys: keys.docs.map((key) => ({
        id: key.id,
        name: key.name,
        createdAt: key.createdAt,
        revokedAt: key.revokedAt,
      })),
    })
  } catch (error) {
    console.error('API key list error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
