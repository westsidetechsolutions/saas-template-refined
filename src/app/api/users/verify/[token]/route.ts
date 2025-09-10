import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function POST(request: NextRequest, { params }: { params: { token: string } }) {
  try {
    const { token } = params

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    // Find the user by token BEFORE verification (token gets cleared after verification)
    const users = await payload.find({
      collection: 'users',
      where: {
        _verificationToken: {
          equals: token,
        },
      },
      limit: 1,
    })

    let userEmail = null
    if (users.docs.length > 0) {
      userEmail = users.docs[0].email
    }

    // Call Payload's verification endpoint directly
    const result = await payload.verifyEmail({
      collection: 'users',
      token,
    })

    return NextResponse.json({
      success: true,
      user: result.user,
      email: userEmail,
    })
  } catch (error: any) {
    console.error('Verification error:', error)

    // Handle specific verification errors
    if (error.message?.includes('token')) {
      return NextResponse.json({ error: 'Invalid or expired verification token' }, { status: 400 })
    }

    return NextResponse.json(
      {
        error: 'Verification failed',
        details: process.env.NODE_ENV === 'development' ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
