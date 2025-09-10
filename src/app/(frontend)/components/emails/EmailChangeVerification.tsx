import React from 'react'
import { Heading, Text, Button, Section } from '@react-email/components'
import EmailTemplate from './EmailTemplate'
import { getEmailTheme } from './theme'

interface EmailChangeVerificationProps {
  brandName?: string
  logoUrl?: string
  appUrl?: string
  userName?: string
  verifyUrl?: string
  expiresAt?: string
}

export const EmailChangeVerification: React.FC<EmailChangeVerificationProps> = ({
  brandName = 'Your Business',
  logoUrl,
  appUrl = 'https://example.com',
  userName,
  verifyUrl = '#',
  expiresAt = '24 hours',
}) => {
  const theme = getEmailTheme()

  return (
    <EmailTemplate
      businessName={brandName}
      logoUrl={logoUrl}
      previewText={`Verify your new email address for ${brandName}`}
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
        Verify Your New Email 📧
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
        You recently requested to change the email address for your {brandName} account. To complete
        this change, please verify this new email address by clicking the button below.
      </Text>

      <Text
        style={{
          color: theme.colors.mutedForeground,
          fontSize: '16px',
          lineHeight: '1.6',
          margin: '0 0 30px 0',
        }}
      >
        Once verified, this email address will become your new login email for your {brandName}
        account.
      </Text>

      <Section
        style={{
          textAlign: 'center',
          margin: '40px 0',
        }}
      >
        <Button
          href={verifyUrl}
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
          Verify Email Address
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
        <strong>Important:</strong> This verification link will expire in {expiresAt}. If you don't
        verify this email address, your account will continue to use your previous email address.
      </Text>

      <Text
        style={{
          color: theme.colors.mutedForeground,
          fontSize: '14px',
          lineHeight: '1.5',
          margin: '10px 0 0 0',
        }}
      >
        If you didn't request this email change, please ignore this email. Your account email will
        remain unchanged.
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

export default EmailChangeVerification
