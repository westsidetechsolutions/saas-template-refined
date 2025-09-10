import { NextResponse } from 'next/server'
import payload from 'payload'
import { Resend } from 'resend'
import VerifyEmail from '../../../app/(frontend)/components/emails/VerifyEmail'

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function POST() {
  try {
    // Get current user from your auth (adjust to your session strategy)
    const { user } = await payload.auth({ headers: {} }) // replace with your own user retrieval
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if ((user as any)._verified) return NextResponse.json({ ok: true, alreadyVerified: true })

    // Generate a fresh token
    const token = await payload.operations.collections.auth.verify.generateEmailVerificationToken({
      collection: 'users',
      userID: user.id,
    })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL!
    const verifyUrl = `${appUrl}/verify?token=${encodeURIComponent(token as string)}`

    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: user.email,
      subject: `Verify your ${process.env.BRAND_NAME ?? 'Account'}`,
      react: VerifyEmail({
        brandName: process.env.BRAND_NAME ?? 'Your App',
        logoUrl: process.env.BRAND_LOGO_URL,
        appUrl,
        userName: (user as any).firstName,
        verifyUrl,
      }),
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error resending verification email:', error)
    return NextResponse.json({ error: 'Failed to resend verification email' }, { status: 500 })
  }
}
