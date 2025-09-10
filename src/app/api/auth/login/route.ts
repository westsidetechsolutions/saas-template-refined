import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    // Authenticate the user
    const { user, token } = await payload.login({
      collection: 'users',
      data: {
        email,
        password,
      },
    })

    // Check if email is verified
    if (!user._verified) {
      return NextResponse.json(
        {
          errors: [
            {
              message:
                'Please verify your email address before logging in. Check your inbox for a verification email.',
            },
          ],
        },
        { status: 401 },
      )
    }

    // Set the authentication cookie
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    })

    // Set the auth cookie
    response.cookies.set('payload-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error: any) {
    console.error('Login error:', error)

    // Handle specific Payload errors
    if (error.errors) {
      const firstError = error.errors[0]
      return NextResponse.json(
        {
          errors: [{ message: firstError.message }],
        },
        { status: 400 },
      )
    }

    // Handle different types of authentication errors
    if (error.message) {
      return NextResponse.json(
        {
          errors: [{ message: error.message }],
        },
        { status: 401 },
      )
    }

    return NextResponse.json(
      {
        errors: [{ message: 'Invalid email or password' }],
      },
      { status: 401 },
    )
  }
}
