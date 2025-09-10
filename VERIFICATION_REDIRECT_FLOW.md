# Email Verification with Redirect Flow

## Overview

This implementation allows users to be redirected to their original destination after email verification, creating a seamless user experience when users sign up from call-to-action buttons.

## How It Works

### 1. Signup with Original Destination

When a user signs up, the system captures their original destination:

```typescript
// In SignupForm.tsx
body: JSON.stringify({
  firstName: formData.firstName,
  lastName: formData.lastName,
  email: formData.email,
  password: formData.password,
  acceptMarketing: formData.acceptMarketing,
  originalDestination: finalNext || next || (planId ? `/pricing?planId=${planId}` : null),
})
```

### 2. Verification Email with Redirect

The verification email includes the original destination in the URL:

```typescript
// In signup/route.ts
let verifyUrl = `${appUrl}/verify-client?token=${encodeURIComponent(token)}`

// Add original destination if provided
if (originalDestination) {
  verifyUrl += `&redirect=${encodeURIComponent(originalDestination)}`
}
```

### 3. Client-Side Verification

The `/verify-client` page handles verification and redirects:

```typescript
// Check if we have a redirect destination
if (redirect) {
  // Redirect to the original destination with verification success
  setTimeout(() => {
    router.push(`${redirect}?verified=true&email=${encodeURIComponent(data.email || '')}`)
  }, 2000)
} else {
  // Fallback to login page
  router.push('/login?verified=true')
}
```

### 4. Destination Page Handling

Destination pages can show verification success messages:

```typescript
// In pricing/page.tsx
useEffect(() => {
  const verified = searchParams.get('verified')
  const email = searchParams.get('email')
  
  if (verified === 'true') {
    setShowVerificationSuccess(true)
    setTimeout(() => {
      setShowVerificationSuccess(false)
    }, 5000)
  }
}, [searchParams])
```

## Flow Examples

### Example 1: User clicks "Get Started" on pricing page

1. User visits `/pricing?planId=price_123`
2. User clicks "Get Started" → redirected to `/signup?planId=price_123`
3. User fills signup form → `originalDestination` is set to `/pricing?planId=price_123`
4. User receives verification email with URL: `/verify-client?token=abc123&redirect=%2Fpricing%3FplanId%3Dprice_123`
5. User clicks verification link → email verified
6. User redirected to `/pricing?planId=price_123&verified=true&email=user@example.com`
7. Pricing page shows success message: "Email verified successfully! Welcome! You can now proceed with your purchase."

### Example 2: User signs up from homepage

1. User visits homepage
2. User clicks "Sign Up" → redirected to `/signup`
3. User fills signup form → no `originalDestination` set
4. User receives verification email with URL: `/verify-client?token=abc123`
5. User clicks verification link → email verified
6. User redirected to `/login?verified=true&email=user@example.com`
7. Login page shows success message and pre-fills email

## API Endpoints

### `/api/auth/signup`
- Accepts `originalDestination` parameter
- Includes redirect in verification email URL

### `/api/auth/verify-and-login`
- Handles verification with redirect
- Returns user info for frontend handling

### `/api/users/verify/[token]`
- Standard verification endpoint
- Used when no redirect is needed

## Benefits

1. **Seamless UX**: Users return to where they started
2. **Context Preservation**: Plan selection, trial parameters, etc. are maintained
3. **Clear Feedback**: Success messages on destination pages
4. **Fallback Support**: Works with or without redirect destinations
5. **Security**: Verification still required, just with better UX

## Implementation Notes

- The redirect URL is URL-encoded to handle special characters
- Success messages auto-hide after 5 seconds
- Email is pre-filled in login form when available
- Works with any destination page that handles `verified=true` parameter
- Maintains backward compatibility with existing flows
