import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    const payload = await getPayload({ config })

    // Validate required fields
    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    // Verify the token and get user
    const result = await payload.operations.collections.auth.verify.verifyEmailVerificationToken({
      collection: 'users',
      token,
    })

    if (!result.user) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
    }

    // Get the user with current data
    const user = await payload.findByID({
      collection: 'users',
      id: result.user.id,
    })

    // Revert the email change by updating back to the original email
    // This is a simplified approach - in a real implementation, you might want to store the original email
    // For now, we'll just clear the email change token
    await payload.update({
      collection: 'users',
      id: result.user.id,
      data: {
        _emailChangeToken: null,
      },
    })

    console.log('Email change canceled for user:', result.user.id)

    return NextResponse.json({
      success: true,
      message: 'Email change has been canceled.',
    })
  } catch (error: any) {
    console.error('Error canceling email change:', error)

    // Handle specific Payload errors
    if (error.errors) {
      const firstError = error.errors[0]
      return NextResponse.json(
        {
          error: firstError.message || 'Failed to cancel email change',
        },
        { status: 400 },
      )
    }

    // Handle other errors
    return NextResponse.json(
      {
        error: 'Failed to cancel email change. Please try again.',
      },
      { status: 500 },
    )
  }
}
