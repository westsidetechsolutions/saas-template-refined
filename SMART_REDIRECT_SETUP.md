# Smart Redirect Setup

## Overview

The smart redirect system automatically directs users to the appropriate page after login based on their subscription status and whether they came from a call-to-action.

## How It Works

### Priority Order
1. **Call-to-Action Parameters** (highest priority)
   - `planId`, `trial`, `finalNext` → redirects to `/post-login`
2. **Next Parameter**
   - `next` → redirects to the specified URL
3. **Smart Redirect** (lowest priority)
   - Based on subscription status

### Smart Redirect Logic
- **Subscribed Users** → `/dashboard`
- **Non-Subscribed Users** → Global settings pricing URL (default: `/#pricing`)

## Implementation

### 1. Global Settings Collection

A new `GlobalSettings` collection allows admins to configure the pricing redirect URL:

```typescript
// src/collections/GlobalSettings.ts
export const GlobalSettings: CollectionConfig = {
  slug: 'global-settings',
  fields: [
    {
      name: 'pricingRedirectUrl',
      type: 'text',
      defaultValue: '/#pricing',
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
}
```

### 2. User Status API

New endpoint `/api/auth/user-status` returns user subscription status and global settings:

```typescript
// Returns:
{
  user: {
    hasActiveSubscription: boolean,
    subscriptionStatus: string,
    // ... other user fields
  },
  globalSettings: {
    pricingRedirectUrl: string,
  }
}
```

### 3. Updated Login Form

The login form now includes smart redirect logic:

```typescript
// src/app/(frontend)/login/LoginForm.tsx
if (planId || trial || finalNext) {
  // Redirect to post-login for CTA flows
  router.push('/post-login?planId=' + planId)
} else if (next) {
  // Handle regular next parameter
  router.push(next)
} else {
  // Smart redirect based on subscription status
  const statusResponse = await fetch('/api/auth/user-status')
  const { user, globalSettings } = await statusResponse.json()
  
  if (user.hasActiveSubscription) {
    router.push('/dashboard')
  } else {
    router.push(globalSettings.pricingRedirectUrl)
  }
}
```

## Subscription Status Logic

A user is considered to have an active subscription if:
- `subscriptionStatus === 'active'`
- `subscriptionStatus === 'trialing'`
- `lastPaymentDate` is within the last 30 days

## Admin Configuration

### Setting Up Global Settings

1. Go to Payload Admin → Settings → Global Settings
2. Create a new settings record or edit existing
3. Set the `pricingRedirectUrl` field:
   - Default: `/#pricing` (homepage pricing section)
   - Custom: `/pricing?utm_source=login`
   - External: `https://example.com/pricing`
4. Ensure `isActive` is checked

### Example URLs

| Use Case | URL |
|----------|-----|
| Homepage pricing section | `/#pricing` |
| Homepage features section | `/#features` |
| Homepage FAQ section | `/#faq` |
| Dedicated pricing page | `/pricing` |
| Pricing with UTM tracking | `/pricing?utm_source=login` |
| External pricing page | `https://example.com/pricing` |

## Testing

Run the test script to verify the logic:

```bash
npx tsx scripts/test-smart-redirect-simple.ts
```

### Test Cases

The system handles these scenarios:

1. **Subscribed user, no CTA** → `/dashboard`
2. **Non-subscribed user, no CTA** → `/#pricing` (or custom URL)
3. **Any user with CTA parameters** → `/post-login`
4. **Any user with next parameter** → specified URL
5. **Admin user** → `/admin`

## Error Handling

- If the user status API fails, users are redirected to `/dashboard` as a fallback
- If global settings are not configured, defaults to `/#pricing`
- CTA parameters always take priority over smart redirect logic

## Files Modified

- `src/collections/GlobalSettings.ts` (new)
- `src/payload.config.ts` (added GlobalSettings collection)
- `src/app/api/auth/user-status/route.ts` (new)
- `src/app/(frontend)/login/LoginForm.tsx` (updated)
- `scripts/test-smart-redirect-simple.ts` (new)

## Benefits

1. **Better UX**: Users go directly to relevant content
2. **Admin Control**: Pricing URL can be changed without code deployment
3. **CTA Priority**: Call-to-action flows are preserved
4. **Fallback Safety**: Graceful degradation if APIs fail
5. **Flexible**: Supports internal and external pricing pages
