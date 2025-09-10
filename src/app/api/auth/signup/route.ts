import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { Resend } from 'resend'
import { render } from '@react-email/render'
import React from 'react'
import VerifyEmail from '../../../../app/(frontend)/components/emails/VerifyEmail'
import { validatePassword } from '@/lib/password-validation'

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, password, originalDestination } = await request.json()

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // Validate password strength
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        {
          error: 'Password does not meet security requirements',
          field: 'password',
          code: 'WEAK_PASSWORD',
          details: passwordValidation.errors,
        },
        { status: 400 },
      )
    }

    // Initialize Resend
    const resend = new Resend(process.env.RESEND_API_KEY!)

    const payload = await getPayload({ config })

    // Create the user with 'user' role
    const user = await payload.create({
      collection: 'users',
      data: {
        firstName,
        lastName,
        email,
        password,
        role: 'user', // Always set to user role
      },
    })

    // Get the verification token
    const freshUser = await payload.findByID({
      collection: 'users',
      id: user.id,
      showHiddenFields: true,
    })

    const token = (freshUser as any)._verificationToken as string | undefined
    if (token) {
      // Send verification email via Resend
      const appUrl = process.env.NEXT_PUBLIC_APP_URL!
      let verifyUrl = `${appUrl}/verify-client?token=${encodeURIComponent(token)}`

      // Add original destination if provided
      if (originalDestination) {
        verifyUrl += `&redirect=${encodeURIComponent(originalDestination)}`
      }

      const emailHtml = await render(
        React.createElement(VerifyEmail, {
          brandName: process.env.BRAND_NAME ?? 'Your App',
          logoUrl: process.env.BRAND_LOGO_URL,
          appUrl,
          userName: user.firstName || '',
          verifyUrl,
        }),
      )

      await resend.emails.send({
        from: process.env.EMAIL_FROM!,
        to: [user.email],
        subject: `Verify your ${process.env.BRAND_NAME ?? 'Account'}`,
        html: emailHtml,
      })

      console.log(`✅ Verification email sent to ${user.email}`)
    }

    // Return success response with redirect info
    return NextResponse.json({
      success: true,
      message: 'Account created successfully. Please check your email to verify your account.',
      redirectTo: '/check-email',
    })
  } catch (error: any) {
    console.error('Signup error:', error)

    // Handle specific Payload errors
    if (error.errors && Array.isArray(error.errors)) {
      const firstError = error.errors[0]

      // Map field names to user-friendly names
      const fieldMap: Record<string, string> = {
        email: 'email',
        password: 'password',
        firstName: 'firstName',
        lastName: 'lastName',
      }

      // Provide user-friendly error messages
      let userMessage = firstError.message
      let field = fieldMap[firstError.field] || 'general'

      // Check for duplicate email error (multiple possible error formats)
      if (
        firstError.message.includes('email') &&
        (firstError.message.includes('unique') ||
          firstError.message.includes('already exists') ||
          firstError.message.includes('duplicate'))
      ) {
        userMessage =
          'An account with this email address already exists. Please try logging in instead.'
        field = 'email'
      }

      // Check for email format validation
      if (firstError.message.includes('email') && firstError.message.includes('valid')) {
        userMessage = 'Please enter a valid email address.'
        field = 'email'
      }

      // Check for password validation
      if (firstError.message.includes('password')) {
        if (firstError.message.includes('length') || firstError.message.includes('8')) {
          userMessage = 'Password must be at least 8 characters long.'
        } else {
          userMessage = 'Please enter a valid password.'
        }
        field = 'password'
      }

      // Check for required field errors
      if (firstError.message.includes('required')) {
        if (firstError.field === 'firstName') {
          userMessage = 'First name is required.'
          field = 'firstName'
        } else if (firstError.field === 'lastName') {
          userMessage = 'Last name is required.'
          field = 'lastName'
        } else if (firstError.field === 'email') {
          userMessage = 'Email address is required.'
          field = 'email'
        } else if (firstError.field === 'password') {
          userMessage = 'Password is required.'
          field = 'password'
        } else {
          userMessage = 'Please fill in all required fields.'
          field = 'general'
        }
      }

      return NextResponse.json(
        {
          error: userMessage,
          field: field,
          code: firstError.code || 'VALIDATION_ERROR',
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
              'An account with this email address already exists. Please try logging in instead.',
            field: 'email',
            code: 'DUPLICATE_EMAIL',
          },
          { status: 400 },
        )
      }
    }

    // Handle other types of errors
    if (error.message) {
      return NextResponse.json(
        {
          error: 'Failed to create account. Please try again.',
          details: error.message,
          code: 'UNKNOWN_ERROR',
        },
        { status: 500 },
      )
    }

    return NextResponse.json(
      {
        error: 'An unexpected error occurred. Please try again.',
        code: 'UNKNOWN_ERROR',
      },
      { status: 500 },
    )
  }
}
