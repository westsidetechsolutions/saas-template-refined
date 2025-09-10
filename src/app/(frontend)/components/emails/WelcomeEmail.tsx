import React from 'react'
import { Heading, Text, Button, Section, Img } from '@react-email/components'
import EmailTemplate from './EmailTemplate'
import { getEmailTheme } from './theme'

interface WelcomeEmailProps {
  businessName?: string
  logoUrl?: string
  userName?: string
  ctaUrl?: string
  ctaText?: string
  customContent?: React.ReactNode
}

export const WelcomeEmail: React.FC<WelcomeEmailProps> = ({
  businessName = 'Your Business',
  logoUrl,
  userName = 'there',
  ctaUrl = '#',
  ctaText = 'Get Started',
  customContent,
}) => {
  const theme = getEmailTheme()

  return (
    <EmailTemplate
      businessName={businessName}
      logoUrl={logoUrl}
      previewText={`Welcome to ${businessName}! We're excited to have you on board.`}
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
        Welcome to {businessName}! 🎉
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
        Hi {userName},
      </Text>

      <Text
        style={{
          color: theme.colors.mutedForeground,
          fontSize: '16px',
          lineHeight: '1.7',
          margin: '0 0 25px 0',
        }}
      >
        Welcome to {businessName}! We're thrilled to have you join our community. You're now part of
        something special, and we can't wait to see what you'll accomplish.
      </Text>

      <Text
        style={{
          color: theme.colors.mutedForeground,
          fontSize: '16px',
          lineHeight: '1.6',
          margin: '0 0 30px 0',
        }}
      >
        To get started, click the button below to explore your dashboard and discover all the
        amazing features we have to offer.
      </Text>

      {customContent && <Section style={{ margin: '30px 0' }}>{customContent}</Section>}

      {/* Decorative divider */}
      <Section style={{ textAlign: 'center', margin: '40px 0' }}>
        <div
          style={{
            width: '60px',
            height: '3px',
            background: `linear-gradient(90deg, ${theme.colors.brand}, ${theme.colors.ring})`,
            margin: '0 auto',
            borderRadius: '2px',
          }}
        />
      </Section>

      <Section
        style={{
          textAlign: 'center',
          margin: '40px 0',
        }}
      >
        <Button
          href={ctaUrl}
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
          {/* Button shine effect */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
              transition: 'left 0.5s ease',
            }}
          />
          {ctaText}
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
        If you have any questions or need help getting started, don't hesitate to reach out to our
        support team. We're here to help you succeed!
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
        The {businessName} Team
      </Text>
    </EmailTemplate>
  )
}

export default WelcomeEmail
