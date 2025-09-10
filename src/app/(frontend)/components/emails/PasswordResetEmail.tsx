import React from 'react'
import { Heading, Text, Button, Section } from '@react-email/components'
import EmailTemplate from './EmailTemplate'
import { getEmailTheme } from './theme'

interface PasswordResetEmailProps {
  brandName?: string
  logoUrl?: string
  appUrl?: string
  userName?: string
  resetUrl?: string
}

export const PasswordResetEmail: React.FC<PasswordResetEmailProps> = ({
  brandName = 'Your Business',
  logoUrl,
  appUrl = 'https://example.com',
  userName,
  resetUrl = '#',
}) => {
  const theme = getEmailTheme()

  return (
    <EmailTemplate
      businessName={brandName}
      logoUrl={logoUrl}
      previewText={`Reset your password for ${brandName}`}
    >
      <Heading
        style={{
          color: theme.colors.foreground,
          fontSize: '32px',
          fontWeight: '800',
          margin: '0 0 25px 0',
          textAlign: 'center',
          letterSpacing: '-0.5px',
        }}
      >
        Reset Your Password 🔐
      </Heading>

      <Text
        style={{
          color: theme.colors.foreground,
          fontSize: '18px',
          fontWeight: '600',
          lineHeight: '1.6',
          margin: '0 0 25px 0',
        }}
      >
        Hi {userName || 'there'},
      </Text>

      <Text
        style={{
          color: theme.colors.mutedForeground,
          fontSize: '16px',
          lineHeight: '1.7',
          margin: '0 0 25px 0',
        }}
      >
        We received a request to reset your password for your {brandName} account. If you didn't
        make this request, you can safely ignore this email.
      </Text>

      <Text
        style={{
          color: theme.colors.mutedForeground,
          fontSize: '16px',
          lineHeight: '1.6',
          margin: '0 0 30px 0',
        }}
      >
        To reset your password, click the button below. This link will expire in 1 hour for security
        reasons.
      </Text>

      <Section
        style={{
          textAlign: 'center',
          margin: '40px 0',
        }}
      >
        <Button
          href={resetUrl}
          style={{
            backgroundColor: theme.colors.brand,
            borderRadius: '12px',
            color: theme.colors.brandForeground,
            fontSize: '18px',
            fontWeight: '700',
            textDecoration: 'none',
            textAlign: 'center',
            display: 'inline-block',
            padding: '16px 32px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            transition: 'all 0.2s ease',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          Reset Password
        </Button>
      </Section>

      <Text
        style={{
          color: theme.colors.mutedForeground,
          fontSize: '14px',
          lineHeight: '1.5',
          margin: '30px 0 0 0',
        }}
      >
        If the button above doesn't work, you can copy and paste the following link into your
        browser:
      </Text>

      <Text
        style={{
          color: theme.colors.brand,
          fontSize: '14px',
          lineHeight: '1.5',
          margin: '10px 0 0 0',
          wordBreak: 'break-all',
        }}
      >
        {resetUrl}
      </Text>

      <Text
        style={{
          color: theme.colors.mutedForeground,
          fontSize: '14px',
          lineHeight: '1.5',
          margin: '30px 0 0 0',
        }}
      >
        If you didn't request a password reset, please ignore this email. Your password will remain
        unchanged.
      </Text>

      <Text
        style={{
          color: theme.colors.mutedForeground,
          fontSize: '14px',
          lineHeight: '1.5',
          margin: '10px 0 0 0',
        }}
      >
        Best regards,
        <br />
        The {brandName} Team
      </Text>
    </EmailTemplate>
  )
}

export default PasswordResetEmail
