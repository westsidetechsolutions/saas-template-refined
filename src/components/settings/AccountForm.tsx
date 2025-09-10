'use client'

import { useState } from 'react'
import { m, viewport, hoverLift } from '@/lib/motion'
import { Stack, Grid } from '@/app/(frontend)/components/layout'
import { Card } from '@/app/(frontend)/components/ui/card'
import { Button } from '@/app/(frontend)/components/ui/button'
import { Input } from '@/app/(frontend)/components/ui/input'
import { Label } from '@/app/(frontend)/components/ui/label'
import { User, Save, CheckCircle, XCircle, Mail, AlertCircle } from 'lucide-react'
import { ResendVerifyEmailButton } from '@/app/(frontend)/components/ResendVerifyEmailButton'
import EmailChangeForm from '@/app/(frontend)/components/EmailChangeForm'
import PasswordChangeForm from '@/app/(frontend)/components/PasswordChangeForm'

interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  role: string
  _verified?: boolean
}

interface AccountFormProps {
  user: User
  onUpdate?: (user: User) => void
}

export function AccountForm({ user, onUpdate }: AccountFormProps) {
  const [form, setForm] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch('/api/user/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })

      if (response.ok) {
        const updatedUser = await response.json()
        showMessage('success', 'Profile updated successfully!')
        onUpdate?.(updatedUser)
      } else {
        const data = await response.json()
        showMessage('error', data.error || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      showMessage('error', 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Stack space="lg">
      {/* Header */}
      <m.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={viewport}
        transition={{ duration: 0.28 }}
      >
        <h2 className="heading-3">Profile Information</h2>
        <p className="body-lg mt-2">Update your personal information and account details</p>
      </m.div>

      {/* Message */}
      {message && (
        <m.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className={`p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200'
              : 'bg-red-50 border border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <XCircle className="h-5 w-5" />
          )}
          <span className="font-medium">{message.text}</span>
        </m.div>
      )}

      {/* Form */}
      <m.div
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={viewport}
        transition={{ duration: 0.24, delay: 0.05 }}
        {...hoverLift}
      >
        <Card className="p-6">
          <form onSubmit={handleSubmit}>
            <Stack space="lg">
              {/* Form Fields */}
              <Grid cols={{ base: 1, sm: 2 }} gap="md">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={form.firstName}
                    onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))}
                    placeholder="Enter your first name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={form.lastName}
                    onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Enter your last name"
                    required
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter your email address"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    This email is used for login and notifications
                  </p>
                </div>

                {/* Email Verification Status */}
                <div className="space-y-2 sm:col-span-2">
                  <Label>Email Verification</Label>
                  <div className="flex items-center gap-3 p-3 rounded-lg border">
                    {user._verified ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-green-800">Email verified</p>
                          <p className="text-xs text-green-600">Your email address is confirmed</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-5 w-5 text-amber-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-amber-800">Email not verified</p>
                          <p className="text-xs text-amber-600">Please verify your email address</p>
                        </div>
                        <ResendVerifyEmailButton />
                      </>
                    )}
                  </div>
                </div>
              </Grid>

              {/* Submit Button */}
              <div className="flex justify-end pt-4 border-t border-border">
                <Button type="submit" disabled={saving}>
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </Stack>
          </form>
        </Card>
      </m.div>

      {/* Email Change Section */}
      <m.div
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={viewport}
        transition={{ duration: 0.24, delay: 0.1 }}
      >
        <EmailChangeForm currentEmail={user.email} />
      </m.div>

      {/* Password Change Section */}
      <m.div
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={viewport}
        transition={{ duration: 0.24, delay: 0.15 }}
      >
        <PasswordChangeForm />
      </m.div>
    </Stack>
  )
}
