'use client'

import { useState } from 'react'
import { m, viewport, hoverLift } from '@/lib/motion'
import { Stack } from '@/app/(frontend)/components/layout'
import { Card } from '@/app/(frontend)/components/ui/card'
import { Button } from '@/app/(frontend)/components/ui/button'
import { Input } from '@/app/(frontend)/components/ui/input'
import { Label } from '@/app/(frontend)/components/ui/label'
import { Mail, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface EmailChangeFormProps {
  currentEmail: string
}

export default function EmailChangeForm({ currentEmail }: EmailChangeFormProps) {
  const [newEmail, setNewEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)
  const [fieldError, setFieldError] = useState('')

  const handleInputChange = (value: string) => {
    setNewEmail(value)
    setMessage(null) // Clear message when user starts typing
    setFieldError('') // Clear field error
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newEmail.trim()) {
      setFieldError('Please enter a new email address.')
      setMessage(null)
      return
    }

    if (newEmail === currentEmail) {
      setFieldError('New email must be different from your current email address.')
      setMessage(null)
      return
    }

    setLoading(true)
    setMessage(null)
    setFieldError('')

    try {
      const response = await fetch('/api/auth/request-email-change', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newEmail }),
      })

      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Email change request sent! Please check both email addresses for confirmation.',
        })
        setNewEmail('')
      } else {
        const data = await response.json()

        // Handle field-specific errors
        if (data.field === 'newEmail') {
          setFieldError(data.error)
          setMessage(null)
        } else {
          // Handle general errors
          setMessage({
            type: 'error',
            text: data.error || 'Failed to request email change.',
          })
          setFieldError('')
        }
      }
    } catch (error) {
      console.error('Error requesting email change:', error)
      setMessage({
        type: 'error',
        text: 'An error occurred while requesting the email change.',
      })
      setFieldError('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <m.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewport}
      {...hoverLift}
    >
      <Card className="p-6">
        <Stack space="lg">
          {/* Header */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-brand/10 rounded-lg">
              <Mail className="h-5 w-5 text-brand" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Change Email Address</h3>
              <p className="text-sm text-muted-foreground">
                Update your email address. You'll need to verify the new email address before the
                change takes effect.
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-email" className="text-sm font-medium text-foreground">
                Current Email
              </Label>
              <Input
                type="email"
                id="current-email"
                value={currentEmail}
                disabled
                className="bg-muted cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-email" className="text-sm font-medium text-foreground">
                New Email Address
              </Label>
              <Input
                type="email"
                id="new-email"
                value={newEmail}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Enter new email address"
                className={`${fieldError ? 'border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50' : ''}`}
                required
                disabled={loading}
              />
              {fieldError && <p className="text-sm text-red-600">{fieldError}</p>}
            </div>

            {/* Message Display */}
            {message && (
              <div
                className={`p-4 rounded-lg flex items-start space-x-3 ${
                  message.type === 'success'
                    ? 'bg-green-50 border border-green-200 text-green-800'
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}
              >
                {message.type === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                )}
                <span className="text-sm font-medium">{message.text}</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end pt-4 border-t border-border">
              <Button type="submit" disabled={loading || !newEmail.trim()} className="shadow-lift">
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-brand-foreground border-t-transparent"></div>
                    <span>Requesting...</span>
                  </div>
                ) : (
                  'Request Email Change'
                )}
              </Button>
            </div>
          </form>

          {/* Info Section */}
          <div className="bg-muted border border-border rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-brand/10 rounded-lg">
                <AlertCircle className="h-5 w-5 text-brand" />
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">How it works:</h3>
                <ul className="space-y-2 text-sm text-foreground">
                  <li className="flex items-start space-x-2">
                    <span className="text-brand font-medium">•</span>
                    <span>You'll receive a confirmation email at your current address</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-brand font-medium">•</span>
                    <span>You'll receive a verification email at your new address</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-brand font-medium">•</span>
                    <span>Both emails must be confirmed for the change to take effect</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-brand font-medium">•</span>
                    <span>You can cancel the change from either email</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </Stack>
      </Card>
    </m.div>
  )
}
