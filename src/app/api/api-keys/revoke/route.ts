import payload from 'payload'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const { keyId, userId } = body

    if (!keyId || !userId) {
      return NextResponse.json({ error: 'Key ID and User ID required' }, { status: 400 })
    }

    // Verify the key belongs to the user
    const key = await payload.findByID({ collection: 'api_keys', id: keyId, depth: 0 })
    if (!key || key.user !== userId) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 })
    }

    // Revoke the key
    await payload.update({
      collection: 'api_keys',
      id: keyId,
      data: { revokedAt: new Date() },
    })

    return NextResponse.json({
      message: 'API key revoked successfully',
    })
  } catch (error) {
    console.error('API key revocation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
