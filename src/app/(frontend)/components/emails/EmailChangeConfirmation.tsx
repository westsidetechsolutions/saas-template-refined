import React from 'react'
import { Heading, Text, Button, Section } from '@react-email/components'
import EmailTemplate from './EmailTemplate'
import { getEmailTheme } from './theme'

interface EmailChangeConfirmationProps {
  brandName?: string
  logoUrl?: string
  appUrl?: string
  userName?: string
  newEmail?: string
  cancelUrl?: string
  expiresAt?: string
}

export const EmailChangeConfirmation: React.FC<EmailChangeConfirmationProps> = ({
  brandName = 'Your Business',
  logoUrl,
  appUrl = 'https://example.com',
  userName,
  newEmail = 'newemail@example.com',
  cancelUrl = '#',
  expiresAt = '24 hours',
}) => {
  const theme = getEmailTheme()

  return (
    <EmailTemplate
      businessName={brandName}
      logoUrl={logoUrl}
      previewText={`Confirm email change request for ${brandName}`}
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
        Confirm Email Change 📧
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
        We received a request to change the email address for your {brandName} account from{' '}
        <strong>this email address</strong> to <strong>{newEmail}</strong>.
      </Text>

      <Text
        style={{
          color: theme.colors.mutedForeground,
          fontSize: '16px',
          lineHeight: '1.6',
          margin: '0 0 30px 0',
        }}
      >
        If you made this request, please click the button below to confirm the change. If you didn't
        make this request, you can safely ignore this email or click the cancel button.
      </Text>

      <Section
        style={{
          textAlign: 'center',
          margin: '40px 0',
        }}
      >
        <Button
          href={cancelUrl}
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
          Confirm Email Change
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
        <strong>Important:</strong> This confirmation link will expire in {expiresAt}. After
        confirmation, you'll receive a verification email at the new address to complete the change.
      </Text>

      <Text
        style={{
          color: theme.colors.mutedForeground,
          fontSize: '14px',
          lineHeight: '1.5',
          margin: '10px 0 0 0',
        }}
      >
        If you didn't request this change, please contact our support team immediately to secure
        your account.
      </Text>

      <Text
        style={{
          color: theme.colors.mutedForeground,
          fontSize: '14px',
          lineHeight: '1.5',
          margin: '30px 0 0 0',
        }}
      >
        Best regards,
        <br />
        The {brandName} Team
      </Text>
    </EmailTemplate>
  )
}

export default EmailChangeConfirmation
