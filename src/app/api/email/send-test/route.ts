import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { render } from '@react-email/render'
import React from 'react'
import VerifyEmail from '../../../../app/(frontend)/components/emails/VerifyEmail'
import PasswordResetEmail from '../../../../app/(frontend)/components/emails/PasswordResetEmail'
import EmailChangeConfirmation from '../../../../app/(frontend)/components/emails/EmailChangeConfirmation'
import EmailChangeVerification from '../../../../app/(frontend)/components/emails/EmailChangeVerification'
import WelcomeLightweight from '../../../../app/(frontend)/components/emails/WelcomeLightweight'
import InvoiceReceipt from '../../../../app/(frontend)/components/emails/InvoiceReceipt'
import PasswordChanged from '../../../../app/(frontend)/components/emails/PasswordChanged'

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    // Check required environment variables
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY environment variable is not set')
      return NextResponse.json({ error: 'Resend API key is not configured' }, { status: 500 })
    }

    if (!process.env.EMAIL_FROM) {
      console.error('EMAIL_FROM environment variable is not set')
      return NextResponse.json({ error: 'Email from address is not configured' }, { status: 500 })
    }

    const {
      to,
      emailType = 'verify',
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
    } = await request.json()

    // Validate required fields
    if (!to || !businessName) {
      return NextResponse.json(
        { error: 'Email address and business name are required' },
        { status: 400 },
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(to)) {
      return NextResponse.json({ error: 'Invalid email address format' }, { status: 400 })
    }

    // Render the email HTML
    let EmailComponent: React.ComponentType<any>
    let emailProps: any

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

    const emailHtml = await render(React.createElement(EmailComponent, emailProps))

    console.log('Email HTML generated successfully, length:', emailHtml.length)
    console.log('Email props:', emailProps)

    // Send the email via Resend
    let emailSubject
    if (emailType === 'reset') {
      emailSubject = `Test Email - ${businessName} Password Reset Email`
    } else if (emailType === 'password-changed') {
      emailSubject = `Test Email - ${businessName} Password Changed`
    } else if (emailType === 'email-change') {
      emailSubject = `Test Email - ${businessName} Email Change Confirmation`
    } else if (emailType === 'email-change-verify') {
      emailSubject = `Test Email - ${businessName} Email Change Verification`
    } else if (emailType === 'welcome-lightweight') {
      emailSubject = `Test Email - ${businessName} Welcome Email`
    } else if (emailType === 'invoice-receipt') {
      emailSubject = `Test Email - ${businessName} Payment Receipt`
    } else {
      emailSubject = `Test Email - ${businessName} Verification Email`
    }

    console.log('Attempting to send email via Resend...')
    console.log('From:', process.env.EMAIL_FROM)
    console.log('To:', to)
    console.log('Subject:', emailSubject)

    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: [to],
      subject: emailSubject,
      html: emailHtml,
    })

    console.log('Resend API response:', result)
    console.log('Test email sent successfully:', {
      to,
      emailType,
      businessName,
      messageId: result.data?.id,
    })

    return NextResponse.json({
      success: true,
      messageId: result.data?.id,
      message: 'Test email sent successfully',
    })
  } catch (error: any) {
    console.error('Error sending test email:', error)

    // Handle Resend-specific errors
    if (error.statusCode) {
      return NextResponse.json(
        {
          error: 'Failed to send email',
          details: error.message,
        },
        { status: error.statusCode },
      )
    }

    // Handle other errors
    return NextResponse.json(
      {
        error: 'Failed to send test email',
        details: error.message || 'Unknown error occurred',
      },
      { status: 500 },
    )
  }
}
