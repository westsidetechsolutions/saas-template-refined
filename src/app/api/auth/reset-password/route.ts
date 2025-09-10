import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { validatePassword } from '@/lib/password-validation'

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    // Validate required fields
    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 })
    }

    // Validate password strength
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        {
          error: passwordValidation.errors.join(', '),
        },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config })

    // Find user by reset token using Payload's built-in functionality
    const result = await payload.resetPassword({
      collection: 'users',
      data: {
        token,
        password,
      },
    })

    console.log('Password reset successful for user:', result.user?.email)

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully.',
      user: {
        id: result.user?.id,
        email: result.user?.email,
      },
    })
  } catch (error: any) {
    console.error('Error resetting password:', error)

    // Handle specific Payload errors
    if (error.errors) {
      const firstError = error.errors[0]
      return NextResponse.json(
        {
          error: firstError.message || 'Failed to reset password',
        },
        { status: 400 },
      )
    }

    // Handle other errors
    return NextResponse.json(
      {
        error: 'Failed to reset password. The token may be invalid or expired.',
      },
      { status: 500 },
    )
  }
}
