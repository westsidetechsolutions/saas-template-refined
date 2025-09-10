'use client'

import { useState } from 'react'
import { m, viewport, hoverLift } from '@/lib/motion'
import { Stack } from '@/app/(frontend)/components/layout'
import { Card } from '@/app/(frontend)/components/ui/card'
import { Button } from '@/app/(frontend)/components/ui/button'
import { Input } from '@/app/(frontend)/components/ui/input'
import { Label } from '@/app/(frontend)/components/ui/label'
import { Lock, Eye, EyeOff, Save, CheckCircle, XCircle, AlertCircle, Shield } from 'lucide-react'
import { PasswordStrength } from '@/app/(frontend)/components/ui/password-strength'
import { validatePassword } from '@/lib/password-validation'

interface ChangePasswordProps {
  onSuccess?: () => void
}

export function ChangePassword({ onSuccess }: ChangePasswordProps) {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
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

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  const passwordValidation = validatePassword(form.newPassword)
  const passwordsMatch = form.newPassword === form.confirmPassword
  const canSubmit =
    form.currentPassword && form.newPassword && passwordsMatch && passwordValidation.isValid

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!canSubmit) {
      showMessage('error', 'Please fill in all fields and ensure passwords match')
      return
    }

    setSaving(true)

    try {
      const response = await fetch('/api/user/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      })

      if (response.ok) {
        showMessage(
          'success',
          "Password changed successfully! You'll receive a confirmation email.",
        )
        setForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        })
        onSuccess?.()
      } else {
        const data = await response.json()
        showMessage('error', data.error || 'Failed to change password')
      }
    } catch (error) {
      console.error('Error changing password:', error)
      showMessage('error', 'Failed to change password')
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
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-brand/10 rounded-lg">
            <Lock className="h-6 w-6 text-brand" />
          </div>
          <div>
            <h2 className="heading-3 text-foreground">Change Password</h2>
            <p className="body-lg text-muted-foreground">
              Update your password to keep your account secure. You'll receive a confirmation email
              when your password is changed.
            </p>
          </div>
        </div>
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
        {...hoverLift}
      >
        <Card className="p-8 border-2 border-border shadow-lift">
          <form onSubmit={handleSubmit}>
            <Stack space="lg">
              {/* Current Password */}
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-sm font-medium text-foreground">
                  Current Password
                </Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPasswords.current ? 'text' : 'password'}
                    value={form.currentPassword}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, currentPassword: e.target.value }))
                    }
                    placeholder="Enter your current password"
                    className="h-11"
                    required
                    disabled={saving}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground hover:text-foreground"
                    onClick={() => togglePasswordVisibility('current')}
                    disabled={saving}
                  >
                    {showPasswords.current ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm font-medium text-foreground">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPasswords.new ? 'text' : 'password'}
                    value={form.newPassword}
                    onChange={(e) => setForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Enter your new password"
                    className={`h-11 ${
                      form.newPassword && !passwordValidation.isValid
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : ''
                    }`}
                    required
                    disabled={saving}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground hover:text-foreground"
                    onClick={() => togglePasswordVisibility('new')}
                    disabled={saving}
                  >
                    {showPasswords.new ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Password Strength Indicator */}
                {form.newPassword && (
                  <div className="mt-3">
                    <PasswordStrength password={form.newPassword} />
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={form.confirmPassword}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                    }
                    placeholder="Confirm your new password"
                    className={`h-11 ${
                      form.confirmPassword && !passwordsMatch
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : ''
                    }`}
                    required
                    disabled={saving}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground hover:text-foreground"
                    onClick={() => togglePasswordVisibility('confirm')}
                    disabled={saving}
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {form.confirmPassword && !passwordsMatch && (
                  <p className="text-xs text-red-600">Passwords do not match</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-6 border-t border-border">
                <Button
                  type="submit"
                  disabled={saving || !canSubmit}
                  className="shadow-lift"
                  size="lg"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? 'Updating Password...' : 'Update Password'}
                </Button>
              </div>
            </Stack>
          </form>
        </Card>
      </m.div>

      {/* Security Tips */}
      <m.div
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={viewport}
        transition={{ duration: 0.24, delay: 0.1 }}
      >
        <Card className="p-6 bg-brand/5 border border-brand/10">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-brand/10 rounded-lg">
              <Shield className="h-5 w-5 text-brand" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-brand-foreground">Security Tips:</h3>
              <ul className="space-y-1 text-sm text-brand-foreground/80">
                <li>• Use a strong, unique password</li>
                <li>• Include uppercase, lowercase, numbers, and symbols</li>
                <li>• Don't reuse passwords from other accounts</li>
                <li>• Consider using a password manager</li>
              </ul>
            </div>
          </div>
        </Card>
      </m.div>
    </Stack>
  )
}
