'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SectionWrapper } from '../components/layout/section'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { m, useFadeInUpVariants, viewport } from '@/lib/motion'
import { CheckCircle, XCircle, ArrowLeft } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      setMessage({
        type: 'error',
        text: 'Please enter your email address.',
      })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Password reset email sent! Check your inbox for instructions.',
        })
        setEmail('')
      } else {
        const data = await response.json()
        setMessage({
          type: 'error',
          text: data.error || 'Failed to send reset email. Please try again.',
        })
      }
    } catch (error) {
      console.error('Error requesting password reset:', error)
      setMessage({
        type: 'error',
        text: 'An error occurred. Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  const title = useFadeInUpVariants({ distance: 16, duration: 0.32 })
  const form = useFadeInUpVariants({ distance: 10, duration: 0.3, delay: 0.05 })

  return (
    <SectionWrapper bg="gradient" padding="loose" fullWidth>
      <div className="mx-auto max-w-md px-6">
        <m.div variants={title} initial="hidden" whileInView="show" viewport={viewport}>
          <div className="text-center mb-8">
            <h1 className="heading-2 text-foreground">Forgot your password?</h1>
            <p className="body-lg text-muted-foreground mt-2">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>
        </m.div>

        {message && (
          <m.div
            variants={form}
            initial="hidden"
            whileInView="show"
            viewport={viewport}
            className={`p-4 rounded-lg mb-6 ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}
          >
            <div className="flex items-center gap-3">
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <span className="text-sm font-medium text-foreground">{message.text}</span>
            </div>
          </m.div>
        )}

        <div className="bg-card border border-border rounded-lg shadow-soft p-8">
          <m.form
            onSubmit={handleSubmit}
            variants={form}
            initial="hidden"
            whileInView="show"
            viewport={viewport}
            className="space-y-6"
          >
            <m.div variants={form}>
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2"
                placeholder="Enter your email address"
                required
                disabled={loading}
              />
            </m.div>

            <m.div variants={form}>
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </Button>
            </m.div>
          </m.form>
        </div>

        <m.div
          variants={form}
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          className="text-center"
        >
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Link>
        </m.div>
      </div>
    </SectionWrapper>
  )
}
