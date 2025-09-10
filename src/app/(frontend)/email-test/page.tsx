'use client'

import React, { useState, useEffect } from 'react'
import { render } from '@react-email/render'
import WelcomeEmail from '../components/emails/WelcomeEmail'

export default function EmailTestPage() {
  const [emailHtml, setEmailHtml] = useState('')

  useEffect(() => {
    const generateEmail = async () => {
      const html = await render(
        <WelcomeEmail
          businessName="TechCorp"
          logoUrl="https://via.placeholder.com/200x80/3b82f6/ffffff?text=TECHCORP"
          userName="Sarah Johnson"
          ctaUrl="https://techcorp.com/dashboard"
          ctaText="Access Dashboard"
          customContent={
            <div
              style={{
                backgroundColor: '#f8f9fa',
                padding: '20px',
                borderRadius: '8px',
                margin: '20px 0',
                border: '1px solid #e9ecef',
              }}
            >
              <h3
                style={{
                  color: '#1a1a1a',
                  margin: '0 0 10px 0',
                  fontSize: '18px',
                  fontWeight: '600',
                }}
              >
                🚀 Quick Start Guide
              </h3>
              <p
                style={{
                  color: '#4a5568',
                  margin: '0 0 15px 0',
                  fontSize: '14px',
                  lineHeight: '1.5',
                }}
              >
                Here are some helpful resources to get you started:
              </p>
              <ul
                style={{
                  color: '#4a5568',
                  margin: '0',
                  paddingLeft: '20px',
                  fontSize: '14px',
                  lineHeight: '1.6',
                }}
              >
                <li style={{ marginBottom: '5px' }}>📝 Complete your profile setup</li>
                <li style={{ marginBottom: '5px' }}>🔍 Explore our features</li>
                <li style={{ marginBottom: '5px' }}>👥 Connect with our community</li>
                <li style={{ marginBottom: '5px' }}>📚 Check out our documentation</li>
              </ul>
            </div>
          }
        />,
      )
      setEmailHtml(html)
    }
    generateEmail()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome Email Test</h1>
          <p className="text-gray-600">This is a static example of the welcome email template.</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Email Preview</h2>
            <p className="text-sm text-gray-500">TechCorp Welcome Email</p>
          </div>
          <div className="p-4">
            <div
              className="border border-gray-200 rounded-lg overflow-hidden"
              style={{ maxHeight: '800px', overflowY: 'auto' }}
            >
              <iframe
                srcDoc={emailHtml}
                className="w-full h-full min-h-[800px]"
                title="Email Preview"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Generated HTML</h2>
            <p className="text-sm text-gray-500">Copy this HTML to use in your email service</p>
          </div>
          <div className="p-4">
            <textarea
              value={emailHtml}
              readOnly
              rows={30}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 font-mono text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
