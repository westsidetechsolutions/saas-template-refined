import React from 'react'
import { Heading, Text, Button, Section } from '@react-email/components'
import EmailTemplate from './EmailTemplate'
import { getEmailTheme } from './theme'

interface WelcomeLightweightProps {
  brandName?: string
  logoUrl?: string
  appUrl?: string
  userName?: string
  gettingStartedUrl?: string
  docsUrl?: string
}

export const WelcomeLightweight: React.FC<WelcomeLightweightProps> = ({
  brandName = 'Your Business',
  logoUrl,
  appUrl = 'https://example.com',
  userName,
  gettingStartedUrl = '#',
  docsUrl = '#',
}) => {
  const theme = getEmailTheme()

  return (
    <EmailTemplate
      businessName={brandName}
      logoUrl={logoUrl}
      previewText={`Welcome to ${brandName}! Let's get you started.`}
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
        Welcome to {brandName}! 🎉
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
        Your account is now verified and ready to go! Here's what you can do next:
      </Text>

      <Section
        style={{
          textAlign: 'center',
          margin: '30px 0',
        }}
      >
        <Button
          href={gettingStartedUrl}
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
          Get Started
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
        Need help? Check out our{' '}
        <a
          href={docsUrl}
          style={{
            color: theme.colors.brand,
            textDecoration: 'none',
          }}
        >
          documentation
        </a>{' '}
        for detailed guides and tutorials.
      </Text>

      <Text
        style={{
          color: theme.colors.mutedForeground,
          fontSize: '14px',
          lineHeight: '1.5',
          margin: '10px 0 0 0',
        }}
      >
        Happy building!
        <br />
        The {brandName} Team
      </Text>
    </EmailTemplate>
  )
}

export default WelcomeLightweight
