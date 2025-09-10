# Welcome Email Setup

This document explains how the welcome email functionality works in the application.

## Overview

When a user verifies their email address, they automatically receive a welcome email. This creates a smooth onboarding experience and guides new users to get started with the application.

## How It Works

### 1. Email Verification Flow

1. **User Registration**: When a user signs up, they receive a verification email
2. **Email Verification**: User clicks the verification link in their email
3. **Verification API**: The `/verify` page calls Payload's verification API
4. **Hook Trigger**: Payload's `afterChange` hook detects the verification status change
5. **Welcome Email**: The hook automatically sends a welcome email

### 2. Technical Implementation

#### Payload Hook (Users.ts)

The `afterChange` hook in the Users collection includes logic to detect when a user's verification status changes from `false` to `true`:

```typescript
// Welcome email when user verifies their email
if (operation === 'update' && 
    (doc as any)._verified === true && 
    previousDoc && 
    (previousDoc as any)._verified === false) {
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
```

#### Email Template

The welcome email uses the `WelcomeLightweight` template which includes:
- Personalized greeting with user's name
- Getting started link (points to dashboard)
- Documentation link
- Clean, professional design

### 3. Environment Variables

Make sure these environment variables are set:

```env
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=notify@yourdomain.com
NEXT_PUBLIC_APP_URL=https://app.yourdomain.com
BRAND_NAME=Your App Name
BRAND_LOGO_URL=https://yourdomain.com/logo.png
```

### 4. Testing

#### Test Welcome Email Only

```bash
npx tsx scripts/test-welcome-email.ts
```

#### Test Complete Verification Flow

```bash
npx tsx scripts/test-verification-flow.ts
```

This test:
1. Creates a test user
2. Simulates email verification
3. Triggers the welcome email
4. Cleans up the test user

### 5. Email Preview

You can preview the welcome email in the email preview page:
- Go to `/email-preview`
- Select "Welcome (Lightweight)" from the dropdown
- Customize the variables
- Send a test email

## Flow Summary

```
User Signs Up → Verification Email → User Clicks Link → 
Verification API → Hook Detects Change → Welcome Email Sent
```

## Customization

### Email Content

To customize the welcome email content, edit:
`src/app/(frontend)/components/emails/WelcomeLightweight.tsx`

### URLs

The welcome email includes these URLs:
- **Getting Started**: `${APP_URL}/dashboard`
- **Documentation**: `${APP_URL}/docs`

You can modify these in the Users.ts hook or update the template to use different URLs.

### Branding

The email uses your brand colors and logo from the theme system. Update the CSS variables in your stylesheet to change the appearance.

## Troubleshooting

### Welcome Email Not Sending

1. **Check Hook Logic**: Ensure the verification status is actually changing from `false` to `true`
2. **Check Environment Variables**: Verify all required environment variables are set
3. **Check Resend API**: Ensure your Resend API key is valid and has sending permissions
4. **Check Logs**: Look for any errors in the server logs

### Test the Flow

Use the test scripts to verify the functionality:

```bash
# Test just the email template
npx tsx scripts/test-welcome-email.ts

# Test the complete flow
npx tsx scripts/test-verification-flow.ts
```

## Security Considerations

- The welcome email is only sent when verification status changes from `false` to `true`
- This prevents duplicate welcome emails if the user is already verified
- The email includes personalized content but no sensitive information
- All links in the email point to your application domain
