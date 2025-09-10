import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function POST(request: NextRequest) {
  try {
    const { token, redirect } = await request.json()

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

    if (users.docs.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const user = users.docs[0]
    const userEmail = user.email

    // Call Payload's verification endpoint directly
    const result = await payload.verifyEmail({
      collection: 'users',
      token,
    })

    // Create a login session for the user
    // Note: We can't get the password from verification, so we'll need to handle this differently
    // For now, we'll return the user info and let the frontend handle the login flow
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      redirect,
    })
  } catch (error: any) {
    console.error('Verify and login error:', error)

    // Handle specific verification errors
    if (error.message?.includes('token')) {
      return NextResponse.json({ error: 'Invalid or expired verification token' }, { status: 400 })
    }

    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
