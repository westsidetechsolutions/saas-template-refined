import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function DELETE(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const { user } = await payload.auth({ headers: request.headers })

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { password } = body

    // Validate password
    if (!password) {
      return NextResponse.json({ error: 'Password is required to delete account' }, { status: 400 })
    }

    // Verify password by attempting to login
    try {
      await payload.login({
        collection: 'users',
        data: {
          email: user.email,
          password: password,
        },
      })
    } catch (error) {
      return NextResponse.json({ error: 'Password is incorrect' }, { status: 400 })
    }

    // Delete user
    await payload.delete({
      collection: 'users',
      id: user.id,
    })

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting account:', error)
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
  }
}
