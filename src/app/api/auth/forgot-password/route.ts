import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { Resend } from 'resend'
import crypto from 'crypto'
import { renderAsync } from '@react-email/render'
import PasswordResetEmail from '@/app/(frontend)/components/emails/PasswordResetEmail'

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    // Validate required fields
    if (!email) {
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address format' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    // Check if user exists
    const users = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: email,
        },
      },
      limit: 1,
    })

    // For security reasons, we always return success even if the user doesn't exist
    if (users.docs.length === 0) {
      console.log('Password reset requested for non-existent email:', email)
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      })
    }

    const user = users.docs[0]

    // Generate a reset token using Payload's method
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour from now

    // Update user with reset token
    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpiration: resetTokenExpiry.toISOString(),
      },
    })

    // Create reset URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const resetUrl = `${appUrl}/reset-password?token=${encodeURIComponent(resetToken)}`

    // Generate email HTML using the beautiful template
    const emailHtml = await renderAsync(
      PasswordResetEmail({
        brandName: process.env.APP_NAME ?? 'Your App',
        logoUrl: process.env.BRAND_LOGO_URL || undefined,
        appUrl,
        userName: user.firstName || undefined,
        resetUrl,
      }),
    )

    // Send password reset email using the beautiful template
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'noreply@example.com',
      to: email,
      subject: `Reset your password for ${process.env.APP_NAME ?? 'Your App'}`,
      html: emailHtml,
    })

    console.log('Password reset email sent to:', email)

    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
    })
  } catch (error: any) {
    console.error('Error requesting password reset:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    })

    // Handle specific Payload errors
    if (error.errors) {
      const firstError = error.errors[0]
      return NextResponse.json(
        {
          error: firstError.message || 'Failed to process password reset request',
        },
        { status: 400 },
      )
    }

    // Handle other errors
    return NextResponse.json(
      {
        error: 'Failed to process password reset request. Please try again.',
      },
      { status: 500 },
    )
  }
}
