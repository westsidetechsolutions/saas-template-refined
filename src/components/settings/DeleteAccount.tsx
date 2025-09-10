'use client'

import { useState } from 'react'
import { m, viewport, hoverLift } from '@/lib/motion'
import { Stack } from '@/app/(frontend)/components/layout'
import { Card } from '@/app/(frontend)/components/ui/card'
import { Button } from '@/app/(frontend)/components/ui/button'
import { Input } from '@/app/(frontend)/components/ui/input'
import { Label } from '@/app/(frontend)/components/ui/label'
import { Checkbox } from '@/app/(frontend)/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/app/(frontend)/components/ui/dialog'
import { Trash2, AlertTriangle, CheckCircle, XCircle, Shield } from 'lucide-react'

interface DeleteAccountProps {
  onSuccess?: () => void
}

export function DeleteAccount({ onSuccess }: DeleteAccountProps) {
  const [showDialog, setShowDialog] = useState(false)
  const [form, setForm] = useState({
    password: '',
    confirmDelete: false,
  })
  const [deleting, setDeleting] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const canDelete = form.password && form.confirmDelete

  const handleDelete = async () => {
    if (!canDelete) {
      showMessage('error', 'Please fill in all fields and confirm deletion')
      return
    }

    setDeleting(true)

    try {
      const response = await fetch('/api/user/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: form.password,
        }),
      })

      if (response.ok) {
        showMessage('success', 'Account deleted successfully')
        setShowDialog(false)
        // Redirect to home page after a short delay
        setTimeout(() => {
          window.location.href = '/'
        }, 2000)
        onSuccess?.()
      } else {
        const data = await response.json()
        showMessage('error', data.error || 'Failed to delete account')
      }
    } catch (error) {
      console.error('Error deleting account:', error)
      showMessage('error', 'Failed to delete account')
    } finally {
      setDeleting(false)
    }
  }

  const resetForm = () => {
    setForm({
      password: '',
      confirmDelete: false,
    })
    setMessage(null)
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
        <h2 className="heading-3">Delete Account</h2>
        <p className="body-lg mt-2">Permanently remove your account and all associated data</p>
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

      {/* Danger Zone Card */}
      <m.div
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={viewport}
        transition={{ duration: 0.24, delay: 0.05 }}
        {...hoverLift}
      >
        <Card className="p-6 border-red-200 dark:border-red-800">
          <Stack space="md">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center dark:bg-red-900/20">
                <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="font-semibold text-red-800 dark:text-red-200">Danger Zone</h3>
                <p className="text-sm text-red-600 dark:text-red-300">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 dark:bg-red-950/50 dark:border-red-800">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                <div className="space-y-2">
                  <p className="font-medium text-red-800 dark:text-red-200">
                    What happens when you delete your account?
                  </p>
                  <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                    <li>• All your data will be permanently deleted</li>
                    <li>• Your subscription will be cancelled</li>
                    <li>• You will lose access to all features</li>
                    <li>• This action cannot be reversed</li>
                  </ul>
                </div>
              </div>
            </div>

            <Dialog
              open={showDialog}
              onOpenChange={(open) => {
                setShowDialog(open)
                if (!open) resetForm()
              }}
            >
              <DialogTrigger asChild>
                <Button variant="destructive" className="w-full sm:w-auto">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <Shield className="h-5 w-5" />
                    Confirm Account Deletion
                  </DialogTitle>
                  <DialogDescription className="text-left">
                    This action will permanently delete your account and all associated data. Please
                    enter your password and confirm that you understand this action cannot be
                    undone.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="deletePassword">Confirm Password</Label>
                    <Input
                      id="deletePassword"
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                      placeholder="Enter your password to confirm"
                      className="border-red-300 focus:border-red-500"
                    />
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="confirmDelete"
                      checked={form.confirmDelete}
                      onCheckedChange={(checked: boolean | 'indeterminate') =>
                        setForm((prev) => ({ ...prev, confirmDelete: checked === true }))
                      }
                      className="mt-1"
                    />
                    <Label
                      htmlFor="confirmDelete"
                      className="text-sm leading-relaxed cursor-pointer"
                    >
                      I understand that this action cannot be undone and I want to permanently
                      delete my account and all associated data.
                    </Label>
                  </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowDialog(false)}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={deleting || !canDelete}
                    className="w-full sm:w-auto"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {deleting ? 'Deleting Account...' : 'Delete Account'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <div className="pt-4 border-t border-red-200 dark:border-red-800">
              <p className="text-xs text-red-600 dark:text-red-300">
                If you're having issues with your account, please contact support before deleting.
              </p>
            </div>
          </Stack>
        </Card>
      </m.div>
    </Stack>
  )
}
