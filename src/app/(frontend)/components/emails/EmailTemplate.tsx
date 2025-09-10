import React from 'react'
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Img,
  Link,
  Hr,
  Button,
} from '@react-email/components'
import { getEmailTheme } from './theme'
import '../../styles.css'

interface EmailTemplateProps {
  businessName?: string
  logoUrl?: string
  children: React.ReactNode
  previewText?: string
}

export const EmailTemplate: React.FC<EmailTemplateProps> = ({
  businessName = 'Your Business',
  logoUrl,
  children,
  previewText,
}) => {
  const theme = getEmailTheme()

  return (
    <Html>
      <Head>
        <title>{businessName}</title>
        {previewText && <meta name="description" content={previewText} />}
      </Head>
      <Body
        style={{
          backgroundColor: theme.colors.background,
          fontFamily: theme.fonts.sans,
          margin: 0,
          padding: 0,
        }}
      >
        <Container
          style={{
            maxWidth: '600px',
            margin: '0 auto',
            backgroundColor: theme.colors.background,
          }}
        >
          {/* Colored Banner */}
          <Section
            style={{
              padding: '30px 20px',
              textAlign: 'center',
              background: `linear-gradient(135deg, ${theme.colors.brand || '#a855f7'} 0%, ${theme.colors.ring || '#7c3aed'} 100%)`,
              color: theme.colors.brandForeground || '#ffffff',
              position: 'relative',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
          >
            {/* Subtle overlay for depth */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background:
                  'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
                pointerEvents: 'none',
              }}
            />
            {logoUrl && (
              <Img
                src={logoUrl}
                alt={`${businessName} Logo`}
                style={{
                  height: '40px',
                  marginBottom: '15px',
                  filter: 'brightness(0) invert(1)', // Make logo white
                }}
              />
            )}
            <Heading
              style={{
                color: theme.colors.brandForeground,
                fontSize: '28px',
                fontWeight: 'bold',
                margin: '0',
                textShadow: '0 1px 2px rgba(0,0,0,0.1)',
              }}
            >
              {businessName}
            </Heading>
          </Section>

          <Hr
            style={{
              border: 'none',
              borderTop: `1px solid ${theme.colors.border}`,
              margin: '0',
            }}
          />

          {/* Main Content */}
          <Section
            style={{
              padding: '40px 20px',
              backgroundColor: theme.colors.background,
              minHeight: '400px',
            }}
          >
            {children}
          </Section>

          {/* Footer */}
          <Hr
            style={{
              border: 'none',
              borderTop: `1px solid ${theme.colors.border}`,
              margin: '0',
            }}
          />

          <Section
            style={{
              padding: '25px 20px',
              textAlign: 'center',
              backgroundColor: theme.colors.muted,
              borderTop: `1px solid ${theme.colors.border}`,
            }}
          >
            <Text
              style={{
                color: theme.colors.mutedForeground,
                fontSize: '14px',
                margin: '0 0 10px 0',
              }}
            >
              © {new Date().getFullYear()} {businessName}. All rights reserved.
            </Text>
            <Text
              style={{
                color: theme.colors.mutedForeground,
                fontSize: '12px',
                margin: '0',
              }}
            >
              This email was sent to you because you signed up for our service.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default EmailTemplate
