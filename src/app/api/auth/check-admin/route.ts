import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function GET() {
  try {
    const headersList = await headers()
    const payload = await getPayload({ config })

    const { user } = await payload.auth({ headers: headersList })

    if (!user) {
      return NextResponse.json(
        {
          isAdmin: false,
          authenticated: false,
          message: 'Not authenticated',
        },
        { status: 401 },
      )
    }

    if (user.role !== 'admin') {
      return NextResponse.json(
        {
          isAdmin: false,
          authenticated: true,
          message: 'Not an admin user',
        },
        { status: 403 },
      )
    }

    return NextResponse.json({
      isAdmin: true,
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Error checking admin access:', error)
    return NextResponse.json(
      {
        isAdmin: false,
        authenticated: false,
        message: 'Authentication error',
      },
      { status: 500 },
    )
  }
}
