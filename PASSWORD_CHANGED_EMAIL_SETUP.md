# Password Changed Email Setup

This document explains how the password changed email functionality works in the application.

## Overview

When a user changes their password from the dashboard settings, they automatically receive a security notification email. This provides users with confirmation that their password was successfully updated and helps them identify any unauthorized changes.

## How It Works

### 1. Password Change Flow

1. **User Updates Password**: User changes password from `/dashboard/settings/account`
2. **API Validation**: Password update API validates current password and new password
3. **Database Update**: Payload updates the user's password in the database
4. **Hook Trigger**: Payload's `afterChange` hook detects the password change
5. **Email Trigger**: Automatically sends password changed notification email

### 2. Technical Implementation

#### Payload Hook (Users.ts)

The `afterChange` hook in the Users collection includes logic to detect when a user's password changes:

```typescript
// Password changed notification
if (
  operation === 'update' &&
  doc.password !== previousDoc?.password &&
  doc.password // Ensure password was actually set (not cleared)
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!
  const supportUrl = `${appUrl}/support`
  const when = new Date().toLocaleString()

  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: doc.email,
    subject: `Password Changed - ${process.env.BRAND_NAME ?? 'Your App'}`,
    react: PasswordChanged({
      brandName: process.env.BRAND_NAME ?? 'Your App',
      logoUrl: process.env.BRAND_LOGO_URL,
      appUrl,
      userName: (doc as any).firstName,
      when,
      supportUrl,
    }),
  })
}
```

#### API Endpoint

The `/api/auth/update-password` endpoint:
1. **Validates current password** to ensure user is authorized
2. **Validates new password** (minimum 8 characters)
3. **Updates password** in the database
4. **Triggers hook** which sends the notification email

#### UI Component

The `PasswordChangeForm` component provides:
- **Current password field** for verification
- **New password field** with validation
- **Confirm password field** to prevent typos
- **Security tips** and guidance
- **Real-time validation** and error handling

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

#### Test Password Changed Email Only

```bash
npx tsx scripts/test-password-changed-email.ts
```

#### Test Complete Password Change Flow

```bash
npx tsx scripts/test-password-change-flow.ts
```

This test:
1. Creates a test user
2. Simulates password change
3. Triggers the password changed email
4. Cleans up the test user

#### Test with Real User Flow

1. Go to `/dashboard/settings/account`
2. Use the "Change Password" section
3. Enter current password and new password
4. Submit the form
5. Check email for the notification

### 5. Email Preview

You can preview the password changed email in the email preview page:
- Go to `/email-preview`
- Select "Password Changed" from the dropdown
- Customize the variables
- Send a test email

## Flow Summary

```
User Changes Password → API Validation → Database Update → 
Hook Detects Change → Send Notification Email → User Receives Email
```

## Security Features

### Password Validation

- **Current password verification** ensures only authorized users can change passwords
- **Minimum length requirement** (8 characters)
- **Password confirmation** prevents typos
- **Different password requirement** prevents reusing the same password

### Email Content

The password changed email includes:
- **Security confirmation** that password was changed
- **Timestamp** of when the change occurred
- **Support contact** if user didn't make the change
- **Security tips** for maintaining account security
- **Professional design** using your brand theme

### Hook Logic

The hook only triggers when:
- Operation is `'update'`
- Password field has changed
- New password is not empty (prevents false positives)

## Customization

### Email Content

To customize the password changed email content, edit:
`src/app/(frontend)/components/emails/PasswordChanged.tsx`

### URLs

The password changed email includes these URLs:
- **Support URL**: `${APP_URL}/support`

You can modify these in the Users.ts hook or update the template.

### Branding

The email uses your brand colors and logo from the theme system. Update the CSS variables in your stylesheet to change the appearance.

## Troubleshooting

### Password Changed Email Not Sending

1. **Check Hook Logic**: Ensure the password field is actually changing
2. **Check Environment Variables**: Verify all required environment variables are set
3. **Check Resend API**: Ensure your Resend API key is valid and has sending permissions
4. **Check Logs**: Look for any errors in the server logs

### Test the Flow

Use the test scripts to verify the functionality:

```bash
# Test just the email template
npx tsx scripts/test-password-changed-email.ts

# Test the complete flow
npx tsx scripts/test-password-change-flow.ts
```

### Common Issues

1. **Hook Not Triggering**: Password field not being updated
   - Solution: Check if the password update is actually changing the field
   
2. **Email Not Sending**: Resend API issues
   - Solution: Verify Resend API key and permissions
   
3. **User Not Found**: User lookup issues
   - Solution: Ensure user exists and is properly authenticated

## Security Considerations

- **Current password verification** prevents unauthorized changes
- **Email notification** alerts users to password changes
- **Support contact** provided for suspicious activity
- **Security tips** help users maintain account security
- **Timestamp** helps users identify when changes occurred

## User Experience

### Dashboard Integration

The password change form is integrated into the account settings page at `/dashboard/settings/account` with:
- **Clear instructions** on password requirements
- **Real-time validation** and error messages
- **Security tips** and best practices
- **Success confirmation** with email notification

### Email Notification

Users receive a professional email that:
- **Confirms the change** was successful
- **Provides security guidance**
- **Offers support contact** for concerns
- **Maintains brand consistency**

## Monitoring

Monitor these metrics:
- Password change success rate
- Email delivery success rate
- Support inquiries about password changes
- Security incident reports
