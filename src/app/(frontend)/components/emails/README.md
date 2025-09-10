# Email Template System with Dynamic Theming

This email template system automatically uses your website's theme colors and fonts, making it easy to maintain consistent branding across your website and emails.

## 🎨 **Dynamic Theme Integration**

### **How It Works:**
- **Automatic Color Extraction**: Colors are pulled from your CSS custom properties (`--brand`, `--foreground`, etc.)
- **Real-time Updates**: Change your website theme and see emails update instantly in the preview
- **Email Client Compatible**: Converts HSL colors to hex for maximum email client support

### **Theme Colors Used:**
- `--brand` → Primary brand color (buttons, links)
- `--foreground` → Main text color
- `--muted-foreground` → Secondary text color
- `--background` → Email background
- `--muted` → Footer background
- `--border` → Dividers and borders

## 📧 **Components**

### **Base Template:**
- `EmailTemplate.tsx` - Base email template with theme colors and inline styles

### **Email Types:**
- `WelcomeEmail.tsx` - Welcome email template

### **Theme Utilities:**
- `theme.ts` - Theme extraction and conversion utilities
- `useEmailTheme.ts` - React hook for dynamic theme access

## 🚀 **Usage**

### **Basic Usage:**
```tsx
import { render } from '@react-email/render'
import { WelcomeEmail } from '../components/emails'

const emailHtml = render(
  <WelcomeEmail
    businessName="Your Company"
    logoUrl="https://example.com/logo.png"
    userName="John Doe"
    ctaUrl="https://example.com/dashboard"
    ctaText="Get Started"
  />
)
```

### **With Custom Content:**
```tsx
const emailHtml = render(
  <WelcomeEmail
    businessName="Your Company"
    userName="John Doe"
    customContent={
      <div style={{ 
        backgroundColor: theme.colors.muted,
        padding: '20px',
        borderRadius: '8px'
      }}>
        <h3 style={{ color: theme.colors.foreground }}>
          Custom Content
        </h3>
      </div>
    }
  />
)
```

## 🎯 **Preview Pages**

### **Interactive Preview** (`/email-preview`)
- Real-time theme color display
- Live email preview with theme changes
- Configurable template props
- Generated HTML output

### **Static Example** (`/email-test`)
- Static welcome email example
- Shows how emails look with current theme

## 🔧 **Customization**

### **Adding New Theme Colors:**
1. Add CSS custom property to `src/app/(frontend)/styles.css`:
   ```css
   :root {
     --new-color: hsl(200 50% 50%);
   }
   ```

2. Update `theme.ts` to include the new color:
   ```tsx
   export function getEmailTheme(): EmailTheme {
     return {
       colors: {
         // ... existing colors
         newColor: hslToHex(getCSSVariable('--new-color')),
       }
     }
   }
   ```

3. Use in email templates:
   ```tsx
   style={{ backgroundColor: theme.colors.newColor }}
   ```

### **Creating New Email Templates:**
1. Extend `EmailTemplate`
2. Use `defaultEmailTheme` for colors
3. Export from `index.ts`
4. Add to preview pages if needed

## 🌙 **Dark Mode Support**

The theme system automatically detects dark mode changes and updates email colors accordingly. However, email clients have limited dark mode support, so emails are optimized for light mode by default.

## 📱 **Email Client Compatibility**

- ✅ Gmail
- ✅ Outlook
- ✅ Apple Mail
- ✅ Yahoo Mail
- ✅ Thunderbird
- ✅ Mobile email clients

## 🔄 **Theme Synchronization**

When you change your website's theme:
1. CSS custom properties update
2. `useEmailTheme` hook detects changes
3. Email previews update automatically
4. Generated HTML uses new colors

This ensures your emails always match your current website branding!
