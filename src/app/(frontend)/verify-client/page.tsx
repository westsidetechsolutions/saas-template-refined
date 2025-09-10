'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, Mail, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function VerifyClientPage() {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token')
      const redirect = searchParams.get('redirect')

      if (!token) {
        setStatus('error')
        setMessage('No verification token provided')
        return
      }

      try {
        // Always use the standard verification API first
        const response = await fetch(`/api/users/verify/${token}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (response.ok) {
          const data = await response.json()
          setStatus('success')
          setMessage(
            redirect
              ? 'Email verified successfully! Redirecting you to your destination...'
              : 'Email verified successfully!',
          )

          // Check if we have a redirect destination
          if (redirect) {
            // Redirect to the original destination with verification success
            setTimeout(() => {
              router.push(`${redirect}?verified=true&email=${encodeURIComponent(data.email || '')}`)
            }, 2000)
          } else {
            // Try to automatically log the user in if we have their email
            if (data.email) {
              try {
                // We'll need to prompt the user for their password or use a different approach
                // For now, we'll redirect to login with the email pre-filled
                setTimeout(() => {
                  router.push(`/login?verified=true&email=${encodeURIComponent(data.email)}`)
                }, 2000)
              } catch (loginError) {
                console.error('Auto-login failed:', loginError)
                // Fallback to regular login
                setTimeout(() => {
                  router.push('/login?verified=true')
                }, 2000)
              }
            } else {
              // No email returned, redirect to login
              setTimeout(() => {
                router.push('/login?verified=true')
              }, 2000)
            }
          }
        } else {
          const errorData = await response.json()
          setStatus('error')
          setMessage(errorData.error || 'Verification failed')
        }
      } catch (error) {
        setStatus('error')
        setMessage('An error occurred during verification')
      }
    }

    verifyEmail()
  }, [searchParams, router])

  if (status === 'verifying') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-4">Verifying your email...</h1>
            <p className="text-gray-600">Please wait while we verify your email address.</p>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-4">Email verified! 🎉</h1>
            <p className="text-gray-600 mb-6">
              Your email has been successfully verified. You'll be redirected to login shortly...
            </p>
            <div className="space-y-3">
              <Link
                href="/login"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Go to login now
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
            <svg
              className="h-8 w-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Verification failed</h1>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="space-y-3">
            <Link
              href="/login"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
