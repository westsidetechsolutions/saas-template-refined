import React from 'react'
import { Heading, Text, Button, Section } from '@react-email/components'
import EmailTemplate from './EmailTemplate'
import { getEmailTheme } from './theme'

interface PasswordChangedProps {
  brandName?: string
  logoUrl?: string
  appUrl?: string
  userName?: string
  when?: string
  supportUrl?: string
}

export const PasswordChanged: React.FC<PasswordChangedProps> = ({
  brandName = 'Your Business',
  logoUrl,
  appUrl = 'https://example.com',
  userName,
  when = new Date().toLocaleString(),
  supportUrl = '#',
}) => {
  const theme = getEmailTheme()

  return (
    <EmailTemplate
      businessName={brandName}
      logoUrl={logoUrl}
      previewText={`Your ${brandName} password was changed`}
    >
      <Heading
        style={{
          color: theme.colors.foreground,
          fontSize: '28px',
          fontWeight: '700',
          margin: '0 0 20px 0',
          textAlign: 'center',
          letterSpacing: '-0.5px',
        }}
      >
        Password Changed 🔐
      </Heading>

      <Text
        style={{
          color: theme.colors.foreground,
          fontSize: '16px',
          fontWeight: '600',
          lineHeight: '1.6',
          margin: '0 0 20px 0',
        }}
      >
        Hi {userName || 'there'},
      </Text>

      <Text
        style={{
          color: theme.colors.mutedForeground,
          fontSize: '16px',
          lineHeight: '1.6',
          margin: '0 0 25px 0',
        }}
      >
        We're confirming that your {brandName} account password was successfully changed on{' '}
        <strong>{when}</strong>.
      </Text>

      <Text
        style={{
          color: theme.colors.mutedForeground,
          fontSize: '16px',
          lineHeight: '1.6',
          margin: '0 0 25px 0',
        }}
      >
        If you made this change, you can safely ignore this email. Your new password is now active
        and you can use it to log in to your account.
      </Text>

      <Text
        style={{
          color: theme.colors.mutedForeground,
          fontSize: '16px',
          lineHeight: '1.6',
          margin: '0 0 30px 0',
        }}
      >
        If you didn't change your password, please contact our support team immediately as your
        account may have been compromised.
      </Text>

      <Section
        style={{
          textAlign: 'center',
          margin: '30px 0',
        }}
      >
        <Button
          href={supportUrl}
          style={{
            backgroundColor: theme.colors.brand,
            borderRadius: '8px',
            color: theme.colors.brandForeground,
            fontSize: '16px',
            fontWeight: '600',
            textDecoration: 'none',
            textAlign: 'center',
            display: 'inline-block',
            padding: '12px 24px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          Contact Support
        </Button>
      </Section>

      <Text
        style={{
          color: theme.colors.mutedForeground,
          fontSize: '14px',
          lineHeight: '1.5',
          margin: '20px 0 0 0',
        }}
      >
        <strong>Security Tips:</strong>
      </Text>

      <Text
        style={{
          color: theme.colors.mutedForeground,
          fontSize: '14px',
          lineHeight: '1.5',
          margin: '10px 0 0 0',
        }}
      >
        • Use a strong, unique password for each account
        <br />
        • Enable two-factor authentication if available
        <br />
        • Never share your password with anyone
        <br />• Log out of your account when using shared devices
      </Text>

      <Text
        style={{
          color: theme.colors.mutedForeground,
          fontSize: '14px',
          lineHeight: '1.5',
          margin: '30px 0 0 0',
        }}
      >
        Thank you for keeping your account secure!
        <br />
        The {brandName} Team
      </Text>
    </EmailTemplate>
  )
}

export default PasswordChanged
