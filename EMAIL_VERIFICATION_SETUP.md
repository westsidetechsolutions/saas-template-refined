# Email Verification Setup Guide

This guide explains how to set up email verification for your Payload CMS application using Resend.

## Environment Variables Required

Add these environment variables to your `.env.local` file:

```bash
# Resend Configuration
RESEND_API_KEY=your_resend_api_key_here

# Email Configuration
EMAIL_FROM=notify@yourdomain.com

# Application URLs
NEXT_PUBLIC_APP_URL=https://app.yourdomain.com
NEXT_PUBLIC_PAYLOAD_URL=https://api.yourdomain.com

# Brand Configuration (optional)
BRAND_NAME=Your App Name
BRAND_LOGO_URL=https://yourdomain.com/logo.png
```

## Features Implemented

### 1. Users Collection Updates
- **File**: `src/collections/Users.ts`
- **Changes**:
  - Enabled email verification with `auth: { verify: true }`
  - Added `afterChange` hook that sends verification email on user creation
  - Uses Resend to send emails instead of Payload's default mailer

### 2. Verify Email Template
- **File**: `src/app/(frontend)/components/emails/VerifyEmail.tsx`
- **Features**:
  - Professional email template using your existing EmailTemplate
  - Dynamic theming that matches your website's colors
  - Clear call-to-action button for email verification
  - Responsive design for all email clients

### 3. Verification Page
- **File**: `src/app/(frontend)/verify/page.tsx`
- **Features**:
  - Server-side token validation
  - Success/failure UI with proper error handling
  - Clean, professional design
  - Direct integration with Payload's verification API

### 4. Resend Verification API
- **File**: `src/app/api/auth/resend-verification/route.ts`
- **Features**:
  - Generates fresh verification tokens
  - Sends new verification emails
  - Handles already verified users gracefully
  - Proper error handling and logging

### 5. Resend Verification Button
- **File**: `src/app/(frontend)/components/ResendVerifyEmailButton.tsx`
- **Features**:
  - Reusable button component
  - Loading states and feedback
  - Error handling
  - Can be used anywhere in your app

### 6. Account Settings Integration
- **Files**: 
  - `src/app/(frontend)/dashboard/settings/account/page.tsx`
  - `src/components/settings/AccountForm.tsx`
- **Features**:
  - Shows email verification status
  - Provides resend verification button for unverified users
  - Clean UI integration

## How It Works

### User Registration Flow
1. User signs up through your registration form
2. Payload creates user with `_verified: false`
3. `afterChange` hook triggers and sends verification email via Resend
4. User receives professional verification email with branded styling
5. User clicks verification link
6. `/verify` page calls Payload's verification API
7. User is marked as verified and can log in

### Resend Verification Flow
1. Unverified user visits account settings
2. Sees verification status and "Resend verification email" button
3. Clicks button to request new verification email
4. API generates fresh token and sends new email
5. User receives new verification email

## Testing the Implementation

### 1. Test New User Registration
```bash
# 1. Sign up with a new email address
# 2. Check your email for verification message
# 3. Click the verification link
# 4. Verify you can log in successfully
```

### 2. Test Verification Page
```bash
# 1. Visit /verify?token=invalid_token
# 2. Should see "Verification failed" message
# 3. Try with valid token (should show success)
```

### 3. Test Resend Functionality
```bash
# 1. Log in as unverified user
# 2. Go to account settings
# 3. Click "Resend verification email"
# 4. Check email for new verification link
```

### 4. Test Already Verified User
```bash
# 1. Log in as verified user
# 2. Go to account settings
# 3. Should see "Email verified" status
# 4. No resend button should be visible
```

## Email Template Customization

The verification email uses your existing email template system:

- **Base Template**: `src/app/(frontend)/components/emails/EmailTemplate.tsx`
- **Theme System**: `src/app/(frontend)/components/emails/theme.ts`
- **Dynamic Colors**: Automatically uses your website's theme colors

### Customizing the Email Content
Edit `src/app/(frontend)/components/emails/VerifyEmail.tsx` to:
- Change the email copy
- Modify the button text
- Add additional sections
- Update branding elements

## Security Considerations

1. **Token Expiry**: Tokens expire after 24 hours (Payload default)
2. **One-time Use**: Tokens are consumed after verification
3. **Rate Limiting**: Consider adding rate limiting to resend endpoint
4. **HTTPS Only**: Ensure all URLs use HTTPS in production

## Troubleshooting

### Common Issues

1. **Emails not sending**
   - Check `RESEND_API_KEY` is valid
   - Verify `EMAIL_FROM` domain is verified in Resend
   - Check Resend dashboard for delivery status

2. **Verification links not working**
   - Ensure `NEXT_PUBLIC_APP_URL` is correct
   - Check `NEXT_PUBLIC_PAYLOAD_URL` is accessible
   - Verify token hasn't expired

3. **Theme colors not working**
   - Check browser console for color conversion errors
   - Verify CSS custom properties are defined
   - Check fallback colors are working

### Debug Mode
Enable debug logging by checking browser console for:
- Email theme debug information
- Color conversion logs
- API response details

## Next Steps

1. **Set up environment variables** with your actual values
2. **Test the complete flow** with a new email address
3. **Customize email content** to match your brand
4. **Add rate limiting** to the resend endpoint if needed
5. **Monitor email delivery** in Resend dashboard

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify all environment variables are set
3. Test with a fresh email address
4. Check Resend dashboard for email delivery status
