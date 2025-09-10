import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function POST(request: NextRequest) {
  try {
    const { newEmail } = await request.json()

    // Validate required fields
    if (!newEmail) {
      return NextResponse.json(
        {
          error: 'New email address is required',
          field: 'newEmail',
          code: 'MISSING_EMAIL',
        },
        { status: 400 },
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newEmail)) {
      return NextResponse.json(
        {
          error: 'Please enter a valid email address',
          field: 'newEmail',
          code: 'INVALID_EMAIL_FORMAT',
        },
        { status: 400 },
      )
    }

    // Get current user from session
    const payload = await getPayload({ config })
    const { user } = await payload.auth({ headers: request.headers })
    if (!user) {
      return NextResponse.json(
        {
          error: 'You must be logged in to change your email address',
          code: 'UNAUTHORIZED',
        },
        { status: 401 },
      )
    }

    // Check if new email is different from current email
    if (user.email === newEmail) {
      return NextResponse.json(
        {
          error: 'New email must be different from your current email address',
          field: 'newEmail',
          code: 'SAME_EMAIL',
        },
        { status: 400 },
      )
    }

    // Check if new email is already in use
    const existingUser = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: newEmail,
        },
      },
    })

    if (existingUser.docs.length > 0) {
      return NextResponse.json(
        {
          error:
            'This email address is already in use by another account. Please choose a different email address.',
          field: 'newEmail',
          code: 'EMAIL_ALREADY_EXISTS',
        },
        { status: 400 },
      )
    }

    // Generate email change token and update user
    // Note: The actual email change logic is handled in the Users collection hooks
    // This endpoint just validates and initiates the process
    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        email: newEmail,
      },
    })

    console.log('Email change requested for user:', user.email, 'to:', newEmail)

    return NextResponse.json({
      success: true,
      message: 'Email change request sent. Please check both email addresses for confirmation.',
    })
  } catch (error: any) {
    console.error('Error requesting email change:', error)

    // Handle specific Payload errors
    if (error.errors && Array.isArray(error.errors)) {
      const firstError = error.errors[0]

      // Map field names to user-friendly names
      const fieldMap: Record<string, string> = {
        email: 'newEmail',
      }

      // Provide user-friendly error messages
      let userMessage = firstError.message
      let field = fieldMap[firstError.field] || 'general'
      let code = 'VALIDATION_ERROR'

      // Check for duplicate email error (multiple possible error formats)
      if (
        firstError.message.includes('email') &&
        (firstError.message.includes('unique') ||
          firstError.message.includes('already exists') ||
          firstError.message.includes('duplicate'))
      ) {
        userMessage =
          'This email address is already in use by another account. Please choose a different email address.'
        field = 'newEmail'
        code = 'EMAIL_ALREADY_EXISTS'
      }

      // Check for email format validation
      if (firstError.message.includes('email') && firstError.message.includes('valid')) {
        userMessage = 'Please enter a valid email address.'
        field = 'newEmail'
        code = 'INVALID_EMAIL_FORMAT'
      }

      return NextResponse.json(
        {
          error: userMessage,
          field: field,
          code: code,
        },
        { status: 400 },
      )
    }

    // Handle MongoDB duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0]
      if (field === 'email') {
        return NextResponse.json(
          {
            error:
              'This email address is already in use by another account. Please choose a different email address.',
            field: 'newEmail',
            code: 'EMAIL_ALREADY_EXISTS',
          },
          { status: 400 },
        )
      }
    }

    // Handle other errors
    return NextResponse.json(
      {
        error: 'Failed to process email change request. Please try again.',
        code: 'UNKNOWN_ERROR',
      },
      { status: 500 },
    )
  }
}
