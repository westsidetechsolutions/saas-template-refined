import React from 'react'
import { Heading, Text, Button, Section, Hr } from '@react-email/components'
import EmailTemplate from './EmailTemplate'
import { getEmailTheme } from './theme'

interface InvoiceReceiptProps {
  brandName?: string
  logoUrl?: string
  appUrl?: string
  userName?: string
  invoiceNumber?: string
  amount?: string
  currency?: string
  date?: string
  description?: string
  receiptUrl?: string
  customerPortalUrl?: string
}

export const InvoiceReceipt: React.FC<InvoiceReceiptProps> = ({
  brandName = 'Your Business',
  logoUrl,
  appUrl = 'https://example.com',
  userName,
  invoiceNumber = 'INV-2024-001',
  amount = '$29.99',
  currency = 'USD',
  date = new Date().toLocaleDateString(),
  description = 'Pro Plan - Monthly Subscription',
  receiptUrl = '#',
  customerPortalUrl = '#',
}) => {
  const theme = getEmailTheme()

  return (
    <EmailTemplate
      businessName={brandName}
      logoUrl={logoUrl}
      previewText={`Payment receipt for ${amount} - ${brandName}`}
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
        Payment Receipt ✅
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
        Thank you for your payment! Your transaction has been completed successfully.
      </Text>

      {/* Receipt Details */}
      <Section
        style={{
          backgroundColor: theme.colors.muted,
          borderRadius: '8px',
          padding: '20px',
          margin: '25px 0',
        }}
      >
        <div style={{ marginBottom: '15px' }}>
          <Text
            style={{
              color: theme.colors.foreground,
              fontSize: '14px',
              fontWeight: '600',
              margin: '0 0 5px 0',
            }}
          >
            Invoice Number
          </Text>
          <Text
            style={{
              color: theme.colors.mutedForeground,
              fontSize: '16px',
              margin: '0',
            }}
          >
            {invoiceNumber}
          </Text>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <Text
            style={{
              color: theme.colors.foreground,
              fontSize: '14px',
              fontWeight: '600',
              margin: '0 0 5px 0',
            }}
          >
            Date
          </Text>
          <Text
            style={{
              color: theme.colors.mutedForeground,
              fontSize: '16px',
              margin: '0',
            }}
          >
            {date}
          </Text>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <Text
            style={{
              color: theme.colors.foreground,
              fontSize: '14px',
              fontWeight: '600',
              margin: '0 0 5px 0',
            }}
          >
            Description
          </Text>
          <Text
            style={{
              color: theme.colors.mutedForeground,
              fontSize: '16px',
              margin: '0',
            }}
          >
            {description}
          </Text>
        </div>

        <Hr
          style={{
            border: 'none',
            borderTop: `1px solid ${theme.colors.border}`,
            margin: '15px 0',
          }}
        />

        <div>
          <Text
            style={{
              color: theme.colors.foreground,
              fontSize: '18px',
              fontWeight: '700',
              margin: '0 0 5px 0',
            }}
          >
            Total Amount
          </Text>
          <Text
            style={{
              color: theme.colors.brand,
              fontSize: '24px',
              fontWeight: '800',
              margin: '0',
            }}
          >
            {amount}
          </Text>
        </div>
      </Section>

      <Section
        style={{
          textAlign: 'center',
          margin: '30px 0',
        }}
      >
        <Button
          href={receiptUrl}
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
            marginRight: '10px',
          }}
        >
          Download Receipt
        </Button>

        <Button
          href={customerPortalUrl}
          style={{
            backgroundColor: 'transparent',
            borderRadius: '8px',
            color: theme.colors.brand,
            fontSize: '16px',
            fontWeight: '600',
            textDecoration: 'none',
            textAlign: 'center',
            display: 'inline-block',
            padding: '12px 24px',
            border: `2px solid ${theme.colors.brand}`,
            cursor: 'pointer',
          }}
        >
          Manage Billing
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
        If you have any questions about this payment, please don't hesitate to contact our support
        team.
      </Text>

      <Text
        style={{
          color: theme.colors.mutedForeground,
          fontSize: '14px',
          lineHeight: '1.5',
          margin: '10px 0 0 0',
        }}
      >
        Thank you for choosing {brandName}!
        <br />
        The {brandName} Team
      </Text>
    </EmailTemplate>
  )
}

export default InvoiceReceipt
