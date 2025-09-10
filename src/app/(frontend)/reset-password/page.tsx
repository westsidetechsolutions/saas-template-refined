'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SectionWrapper } from '@/app/(frontend)/components/layout'
import { Button } from '@/app/(frontend)/components/ui/button'
import { Input } from '@/app/(frontend)/components/ui/input'
import { Label } from '@/app/(frontend)/components/ui/label'
import { PasswordStrength } from '@/app/(frontend)/components/ui/password-strength'
import { validatePassword } from '@/lib/password-validation'
import { CheckCircle, XCircle, ArrowLeft, Lock } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams?.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const passwordValidation = validatePassword(password)

  useEffect(() => {
    if (!token) {
      setMessage({
        type: 'error',
        text: 'No reset token provided. Please request a new password reset.',
      })
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token) {
      setMessage({
        type: 'error',
        text: 'No reset token provided.',
      })
      return
    }

    if (!passwordValidation.isValid) {
      setMessage({
        type: 'error',
        text: passwordValidation.errors.join(', '),
      })
      return
    }

    if (password !== confirmPassword) {
      setMessage({
        type: 'error',
        text: 'Passwords do not match.',
      })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password,
        }),
      })

      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Password reset successfully! Redirecting to login...',
        })
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else {
        const data = await response.json()
        setMessage({
          type: 'error',
          text: data.error || 'Failed to reset password. Please try again.',
        })
      }
    } catch (error) {
      console.error('Error resetting password:', error)
      setMessage({
        type: 'error',
        text: 'An error occurred. Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <SectionWrapper>
        <div className="max-w-md w-full mx-auto">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="heading-2 mb-4">Invalid Reset Link</h1>
            <p className="body-lg text-muted-foreground mb-8">
              This password reset link is invalid or has expired.
            </p>
            <Button asChild>
              <a href="/forgot-password">Request New Reset Link</a>
            </Button>
          </div>
        </div>
      </SectionWrapper>
    )
  }

  return (
    <SectionWrapper>
      <div className="max-w-md w-full mx-auto">
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-brand/10 mb-6">
            <Lock className="h-8 w-8 text-brand" />
          </div>
          <h1 className="heading-2 mb-4">Reset Your Password</h1>
          <p className="body-lg text-muted-foreground">Enter your new password below.</p>
        </div>

        {message && (
          <div
            className={`p-4 rounded-lg mb-6 border ${
              message.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <XCircle className="h-5 w-5" />
              )}
              <span className="font-medium">{message.text}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your new password"
              required
            />
            <PasswordStrength password={password} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading || !passwordValidation.isValid}
            className="w-full"
          >
            {loading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                Resetting...
              </>
            ) : (
              'Reset Password'
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Button variant="ghost" asChild>
            <a href="/login" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </a>
          </Button>
        </div>
      </div>
    </SectionWrapper>
  )
}
