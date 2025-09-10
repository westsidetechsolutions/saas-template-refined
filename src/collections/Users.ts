import type { CollectionConfig } from 'payload'
import { Resend } from 'resend'
import VerifyEmail from '../app/(frontend)/components/emails/VerifyEmail'
import PasswordResetEmail from '../app/(frontend)/components/emails/PasswordResetEmail'
import EmailChangeConfirmation from '../app/(frontend)/components/emails/EmailChangeConfirmation'
import EmailChangeVerification from '../app/(frontend)/components/emails/EmailChangeVerification'
import WelcomeLightweight from '../app/(frontend)/components/emails/WelcomeLightweight'
import PasswordChanged from '../app/(frontend)/components/emails/PasswordChanged'

const resend = new Resend(process.env.RESEND_API_KEY!)

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: {
    verify: true,
    forgotPassword: true,
  },
  hooks: {
    afterChange: [
      async ({ operation, doc, req, previousDoc }) => {
        // Email verification on user creation - DISABLED
        // We now handle this in the signup API to avoid duplicate emails
        // if (operation === 'create') {
        //   // Already verified? (edge case if using social login later)
        //   if ((doc as any)._verified) return

        //   // Token can be present on doc; if not, fetch with hidden fields
        //   let token: string | undefined = (doc as any)._verificationToken
        //   if (!token) {
        //     const fresh = await req.payload.findByID({
        //       collection: 'users',
        //       id: doc.id,
        //       showHiddenFields: true,
        //     })
        //     token = (fresh as any)._verificationToken
        //   }
        //   if (!token) return

        //   const appUrl = process.env.NEXT_PUBLIC_APP_URL!
        //   const verifyUrl = `${appUrl}/verify?token=${encodeURIComponent(token)}`

        //   await resend.emails.send({
        //     from: process.env.EMAIL_FROM!,
        //     to: doc.email,
        //     subject: `Verify your ${process.env.BRAND_NAME ?? 'Account'}`,
        //     react: VerifyEmail({
        //       brandName: process.env.BRAND_NAME ?? 'Your App',
        //       logoUrl: process.env.BRAND_LOGO_URL,
        //       appUrl,
        //       userName: (doc as any).firstName,
        //       verifyUrl,
        //   }),
        //   })
        // }

        // Email change confirmation
        if (operation === 'update' && doc.email !== previousDoc?.email) {
          const appUrl = process.env.NEXT_PUBLIC_APP_URL!
          const cancelUrl = `${appUrl}/cancel-email-change?token=${encodeURIComponent((doc as any)._emailChangeToken || '')}`

          // Send confirmation email to old email address
          await resend.emails.send({
            from: process.env.EMAIL_FROM!,
            to: previousDoc?.email,
            subject: `Confirm email change for ${process.env.BRAND_NAME ?? 'Your App'}`,
            react: EmailChangeConfirmation({
              brandName: process.env.BRAND_NAME ?? 'Your App',
              logoUrl: process.env.BRAND_LOGO_URL,
              appUrl,
              userName: (doc as any).firstName,
              newEmail: doc.email,
              cancelUrl,
              expiresAt: '24 hours',
            }),
          })

          // Send verification email to new email address
          const verifyUrl = `${appUrl}/verify-email-change?token=${encodeURIComponent((doc as any)._emailChangeToken || '')}`
          await resend.emails.send({
            from: process.env.EMAIL_FROM!,
            to: doc.email,
            subject: `Verify your new email for ${process.env.BRAND_NAME ?? 'Your App'}`,
            react: EmailChangeVerification({
              brandName: process.env.BRAND_NAME ?? 'Your App',
              logoUrl: process.env.BRAND_LOGO_URL,
              appUrl,
              userName: (doc as any).firstName,
              verifyUrl,
              expiresAt: '24 hours',
            }),
          })
        }

        // Welcome email when user verifies their email
        if (
          operation === 'update' &&
          (doc as any)._verified === true &&
          previousDoc &&
          (previousDoc as any)._verified === false
        ) {
          const appUrl = process.env.NEXT_PUBLIC_APP_URL!
          const gettingStartedUrl = `${appUrl}/dashboard`
          const docsUrl = `${appUrl}/docs`

          await resend.emails.send({
            from: process.env.EMAIL_FROM!,
            to: doc.email,
            subject: `Welcome to ${process.env.BRAND_NAME ?? 'Your App'}!`,
            react: WelcomeLightweight({
              brandName: process.env.BRAND_NAME ?? 'Your App',
              logoUrl: process.env.BRAND_LOGO_URL,
              appUrl,
              userName: (doc as any).firstName,
              gettingStartedUrl,
              docsUrl,
            }),
          })
        }
      },
    ],
    afterForgotPassword: [
      async ({ args }) => {
        // Payload's built-in forgotPassword method automatically sends the email
        // No need to manually send email here
        console.log('Password reset requested for user:', args.email)
      },
    ],
  },
  fields: [
    {
      name: 'firstName',
      type: 'text',
    },
    {
      name: 'lastName',
      type: 'text',
    },
    {
      name: 'timezone',
      type: 'select',
      options: [
        { label: 'GMT+0 Greenwich Mean Time (GMT)', value: 'GMT+0' },
        { label: 'GMT+1 Central European Time (CET)', value: 'GMT+1' },
        { label: 'GMT+2 Eastern European Time (EET)', value: 'GMT+2' },
        { label: 'GMT+3 Moscow Time (MSK)', value: 'GMT+3' },
        { label: 'GMT+5 Pakistan Standard Time (PKT)', value: 'GMT+5' },
        { label: 'GMT+8 China Standard Time (CST)', value: 'GMT+8' },
        { label: 'GMT+10 Eastern Australia Standard Time (AEST)', value: 'GMT+10' },
        { label: 'GMT-5 Eastern Standard Time (EST)', value: 'GMT-5' },
        { label: 'GMT-6 Central Standard Time (CST)', value: 'GMT-6' },
        { label: 'GMT-7 Mountain Standard Time (MST)', value: 'GMT-7' },
        { label: 'GMT-8 Pacific Standard Time (PST)', value: 'GMT-8' },
      ],
      defaultValue: 'GMT+0',
    },
    {
      name: 'role',
      type: 'select',
      options: ['user', 'admin'],
      defaultValue: 'user',
    },
    {
      name: 'stripeCustomerId',
      type: 'text',
      admin: { readOnly: true },
    },
    {
      name: 'stripeSubscriptionId',
      type: 'text',
      admin: { readOnly: true },
    },
    {
      name: 'subscriptionStatus',
      type: 'select',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Canceled', value: 'canceled' },
        { label: 'Past Due', value: 'past_due' },
        { label: 'Unpaid', value: 'unpaid' },
        { label: 'Incomplete', value: 'incomplete' },
        { label: 'Incomplete Expired', value: 'incomplete_expired' },
        { label: 'Trialing', value: 'trialing' },
        { label: 'Paused', value: 'paused' },
      ],
      admin: { readOnly: true },
    },
    {
      name: 'subscriptionPlan',
      type: 'text',
      admin: { readOnly: true },
    },
    {
      name: 'subscriptionCurrentPeriodEnd',
      type: 'date',
      admin: { readOnly: true },
    },
    {
      name: 'lastPaymentDate',
      type: 'date',
      admin: { readOnly: true },
    },
    {
      name: 'planPriceId',
      type: 'text',
      admin: { readOnly: true },
    },
    {
      name: 'cancelAt',
      type: 'date',
      admin: { readOnly: true },
    },
    {
      name: 'canceledAt',
      type: 'date',
      admin: { readOnly: true },
    },
    {
      name: 'trialEnd',
      type: 'date',
      admin: { readOnly: true },
    },
    {
      name: 'hasUsedTrial',
      type: 'checkbox',
      defaultValue: false,
      admin: { readOnly: true },
    },
  ],
}
