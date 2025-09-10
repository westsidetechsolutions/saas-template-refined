import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { validatePassword } from '@/lib/password-validation'
import { Resend } from 'resend'
import { render } from '@react-email/render'
import React from 'react'
import PasswordChanged from '@/app/(frontend)/components/emails/PasswordChanged'

export async function PUT(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const { user } = await payload.auth({ headers: request.headers })

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { currentPassword, newPassword } = body

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 },
      )
    }

    // Validate new password strength
    const passwordValidation = validatePassword(newPassword)
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        {
          error: 'New password does not meet security requirements',
          field: 'newPassword',
          code: 'WEAK_PASSWORD',
          details: passwordValidation.errors,
        },
        { status: 400 },
      )
    }

    // Verify current password by attempting to login
    try {
      await payload.login({
        collection: 'users',
        data: {
          email: user.email,
          password: currentPassword,
        },
      })
    } catch (error) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
    }

    // Update password
    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        password: newPassword,
      },
    })

    // Send password changed notification email
    try {
      const resend = new Resend(process.env.RESEND_API_KEY!)
      const appUrl = process.env.NEXT_PUBLIC_APP_URL!
      const supportUrl = `${appUrl}/support`
      const when = new Date().toLocaleString()

      const emailHtml = await render(
        React.createElement(PasswordChanged, {
          brandName: process.env.BRAND_NAME ?? 'Your App',
          logoUrl: process.env.BRAND_LOGO_URL,
          appUrl,
          userName: user.firstName || '',
          when,
          supportUrl,
        }),
      )

      await resend.emails.send({
        from: process.env.EMAIL_FROM!,
        to: [user.email],
        subject: `Password Changed - ${process.env.BRAND_NAME ?? 'Your App'}`,
        html: emailHtml,
      })

      console.log('✅ Password changed notification sent to:', user.email)
    } catch (emailError) {
      console.error('❌ Failed to send password changed notification:', emailError)
      // Don't fail the password change if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully',
    })
  } catch (error) {
    console.error('Error changing password:', error)
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 })
  }
}
