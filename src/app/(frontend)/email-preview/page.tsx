'use client'

import React, { useState, useEffect } from 'react'
import { render } from '@react-email/render'
import VerifyEmail from '../components/emails/VerifyEmail'
import PasswordResetEmail from '../components/emails/PasswordResetEmail'
import PasswordChanged from '../components/emails/PasswordChanged'
import EmailChangeConfirmation from '../components/emails/EmailChangeConfirmation'
import EmailChangeVerification from '../components/emails/EmailChangeVerification'
import WelcomeLightweight from '../components/emails/WelcomeLightweight'
import InvoiceReceipt from '../components/emails/InvoiceReceipt'
import { useEmailTheme } from '../components/emails/useEmailTheme'

export default function EmailPreviewPage() {
  const { theme, isClient } = useEmailTheme()
  const [businessName, setBusinessName] = useState('Acme Corp')
  const [logoUrl, setLogoUrl] = useState(
    'https://via.placeholder.com/200x80/3b82f6/ffffff?text=LOGO',
  )
  const [userName, setUserName] = useState('John Doe')
  const [ctaUrl, setCtaUrl] = useState('https://example.com/dashboard')
  const [newEmail, setNewEmail] = useState('newemail@example.com')
  const [expiresAt, setExpiresAt] = useState('24 hours')
  const [gettingStartedUrl, setGettingStartedUrl] = useState('https://example.com/getting-started')
  const [docsUrl, setDocsUrl] = useState('https://example.com/docs')
  const [invoiceNumber, setInvoiceNumber] = useState('INV-2024-001')
  const [amount, setAmount] = useState('$29.99')
  const [date, setDate] = useState(new Date().toLocaleDateString())
  const [description, setDescription] = useState('Pro Plan - Monthly Subscription')
  const [customerPortalUrl, setCustomerPortalUrl] = useState('https://example.com/billing')
  const [when, setWhen] = useState(new Date().toLocaleString())
  const [supportUrl, setSupportUrl] = useState('https://example.com/support')
  const [testEmail, setTestEmail] = useState('chris@westsidetechsolutions.com')
  const [sendingTest, setSendingTest] = useState(false)
  const [testEmailStatus, setTestEmailStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [emailType, setEmailType] = useState<
    | 'verify'
    | 'reset'
    | 'password-changed'
    | 'email-change'
    | 'email-change-verify'
    | 'welcome-lightweight'
    | 'invoice-receipt'
  >('verify')
  const [emailHtml, setEmailHtml] = useState('')

  useEffect(() => {
    const generateEmail = async () => {
      let EmailComponent
      let emailProps

      if (emailType === 'reset') {
        EmailComponent = PasswordResetEmail
        emailProps = {
          brandName: businessName,
          logoUrl,
          userName,
          resetUrl: ctaUrl,
        }
      } else if (emailType === 'password-changed') {
        EmailComponent = PasswordChanged
        emailProps = {
          brandName: businessName,
          logoUrl,
          userName,
          when,
          supportUrl,
        }
      } else if (emailType === 'email-change') {
        EmailComponent = EmailChangeConfirmation
        emailProps = {
          brandName: businessName,
          logoUrl,
          userName,
          newEmail,
          cancelUrl: ctaUrl,
          expiresAt,
        }
      } else if (emailType === 'email-change-verify') {
        EmailComponent = EmailChangeVerification
        emailProps = {
          brandName: businessName,
          logoUrl,
          userName,
          verifyUrl: ctaUrl,
          expiresAt,
        }
      } else if (emailType === 'welcome-lightweight') {
        EmailComponent = WelcomeLightweight
        emailProps = {
          brandName: businessName,
          logoUrl,
          userName,
          gettingStartedUrl,
          docsUrl,
        }
      } else if (emailType === 'invoice-receipt') {
        EmailComponent = InvoiceReceipt
        emailProps = {
          brandName: businessName,
          logoUrl,
          userName,
          invoiceNumber,
          amount,
          date,
          description,
          receiptUrl: ctaUrl,
          customerPortalUrl,
        }
      } else {
        EmailComponent = VerifyEmail
        emailProps = {
          brandName: businessName,
          logoUrl,
          userName,
          verifyUrl: ctaUrl,
        }
      }

      const html = await render(<EmailComponent {...emailProps} />)
      setEmailHtml(html)
    }
    generateEmail()
  }, [
    businessName,
    logoUrl,
    userName,
    ctaUrl,
    theme,
    emailType,
    newEmail,
    expiresAt,
    gettingStartedUrl,
    docsUrl,
    invoiceNumber,
    amount,
    date,
    description,
    customerPortalUrl,
    when,
    supportUrl,
  ])

  const sendTestEmail = async () => {
    setSendingTest(true)
    setTestEmailStatus('idle')

    try {
      const response = await fetch('/api/email/send-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: testEmail,
          emailType,
          businessName,
          logoUrl,
          userName,
          ctaUrl,
          newEmail,
          expiresAt,
          gettingStartedUrl,
          docsUrl,
          invoiceNumber,
          amount,
          date,
          description,
          customerPortalUrl,
          when,
          supportUrl,
        }),
      })

      if (response.ok) {
        setTestEmailStatus('success')
        setTimeout(() => setTestEmailStatus('idle'), 5000)
      } else {
        const error = await response.json()
        console.error('Failed to send test email:', error)
        setTestEmailStatus('error')
        setTimeout(() => setTestEmailStatus('idle'), 5000)
      }
    } catch (error) {
      console.error('Error sending test email:', error)
      setTestEmailStatus('error')
      setTimeout(() => setTestEmailStatus('idle'), 5000)
    } finally {
      setSendingTest(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Email Template Preview</h1>
          <p className="text-gray-600">
            Configure your email templates and see them rendered in real-time with your website's
            theme colors.
          </p>
          {isClient && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">Theme Information</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="font-medium">Brand:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <div
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: theme.colors.brand }}
                    />
                    <code>{theme.colors.brand}</code>
                  </div>
                </div>
                <div>
                  <span className="font-medium">Background:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <div
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: theme.colors.background }}
                    />
                    <code>{theme.colors.background}</code>
                  </div>
                </div>
                <div>
                  <span className="font-medium">Foreground:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <div
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: theme.colors.foreground }}
                    />
                    <code>{theme.colors.foreground}</code>
                  </div>
                </div>
                <div>
                  <span className="font-medium">Muted:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <div
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: theme.colors.muted }}
                    />
                    <code>{theme.colors.muted}</code>
                  </div>
                </div>
              </div>
              <p className="text-xs text-blue-700 mt-2">
                Colors are automatically extracted from your website's CSS custom properties. Change
                your theme and see the emails update in real-time!
              </p>
              <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                <strong>Debug Info:</strong>
                <br />
                Brand: {theme.colors.brand}
                <br />
                Background: {theme.colors.background}
                <br />
                Foreground: {theme.colors.foreground}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Template Configuration</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Type</label>
                <select
                  value={emailType}
                  onChange={(e) =>
                    setEmailType(e.target.value as 'verify' | 'reset' | 'email-change')
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="verify">Verification Email</option>
                  <option value="reset">Password Reset Email</option>
                  <option value="password-changed">Password Changed</option>
                  <option value="email-change">Email Change Confirmation</option>
                  <option value="email-change-verify">Email Change Verification</option>
                  <option value="welcome-lightweight">Welcome (Lightweight)</option>
                  <option value="invoice-receipt">Invoice/Receipt</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Logo URL</label>
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">User Name</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {emailType === 'reset'
                    ? 'Reset URL'
                    : emailType === 'password-changed'
                      ? 'Support URL'
                      : emailType === 'email-change'
                        ? 'Cancel URL'
                        : emailType === 'email-change-verify'
                          ? 'Verify URL'
                          : emailType === 'welcome-lightweight'
                            ? 'Getting Started URL'
                            : emailType === 'invoice-receipt'
                              ? 'Receipt URL'
                              : 'Verification URL'}
                </label>
                <input
                  type="url"
                  value={ctaUrl}
                  onChange={(e) => setCtaUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={
                    emailType === 'reset'
                      ? 'https://example.com/reset-password?token=...'
                      : emailType === 'password-changed'
                        ? 'https://example.com/support'
                        : emailType === 'email-change'
                          ? 'https://example.com/cancel-email-change?token=...'
                          : emailType === 'email-change-verify'
                            ? 'https://example.com/verify-email-change?token=...'
                            : emailType === 'welcome-lightweight'
                              ? 'https://example.com/getting-started'
                              : emailType === 'invoice-receipt'
                                ? 'https://example.com/receipt/INV-2024-001'
                                : 'https://example.com/verify?token=...'
                  }
                />
              </div>

              {/* Email Change Confirmation specific fields */}
              {(emailType === 'email-change' || emailType === 'email-change-verify') && (
                <>
                  {emailType === 'email-change' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Email Address
                      </label>
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="newemail@example.com"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiration Time
                    </label>
                    <input
                      type="text"
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="24 hours"
                    />
                  </div>
                </>
              )}

              {/* Welcome Lightweight specific fields */}
              {emailType === 'welcome-lightweight' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Documentation URL
                    </label>
                    <input
                      type="url"
                      value={docsUrl}
                      onChange={(e) => setDocsUrl(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com/docs"
                    />
                  </div>
                </>
              )}

              {/* Password Changed specific fields */}
              {emailType === 'password-changed' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      When Changed
                    </label>
                    <input
                      type="text"
                      value={when}
                      onChange={(e) => setWhen(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="1/15/2024, 2:30:45 PM"
                    />
                  </div>
                </>
              )}

              {/* Invoice Receipt specific fields */}
              {emailType === 'invoice-receipt' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Invoice Number
                    </label>
                    <input
                      type="text"
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="INV-2024-001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                    <input
                      type="text"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="$29.99"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                    <input
                      type="text"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="1/15/2024"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Pro Plan - Monthly Subscription"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer Portal URL
                    </label>
                    <input
                      type="url"
                      value={customerPortalUrl}
                      onChange={(e) => setCustomerPortalUrl(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com/billing"
                    />
                  </div>
                </>
              )}

              {/* Test Email Section */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold mb-4">Send Test Email</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Test Email Address
                    </label>
                    <input
                      type="email"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter email address to send test to"
                    />
                  </div>

                  <button
                    onClick={sendTestEmail}
                    disabled={sendingTest || !testEmail}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {sendingTest ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        Send Test Email
                      </>
                    )}
                  </button>

                  {testEmailStatus === 'success' && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                      <div className="flex items-center gap-2 text-green-800">
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="text-sm font-medium">Test email sent successfully!</span>
                      </div>
                      <p className="text-xs text-green-600 mt-1">
                        Check your email inbox for the test message.
                      </p>
                    </div>
                  )}

                  {testEmailStatus === 'error' && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <div className="flex items-center gap-2 text-red-800">
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                        <span className="text-sm font-medium">Failed to send test email</span>
                      </div>
                      <p className="text-xs text-red-600 mt-1">
                        Check the console for error details.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Email Preview</h2>
              <p className="text-sm text-gray-500">This is how your email will look</p>
            </div>
            <div className="p-4">
              <div
                className="border border-gray-200 rounded-lg overflow-hidden"
                style={{ maxHeight: '600px', overflowY: 'auto' }}
              >
                <iframe
                  srcDoc={emailHtml}
                  className="w-full h-full min-h-[600px]"
                  title="Email Preview"
                />
              </div>
            </div>
          </div>
        </div>

        {/* HTML Output */}
        <div className="mt-8 bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Generated HTML</h2>
            <p className="text-sm text-gray-500">Copy this HTML to use in your email service</p>
          </div>
          <div className="p-4">
            <textarea
              value={emailHtml}
              readOnly
              rows={20}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 font-mono text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
