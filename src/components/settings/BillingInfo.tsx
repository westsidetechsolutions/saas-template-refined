'use client'

import { useState } from 'react'
import { m, viewport, hoverLift } from '@/lib/motion'
import { Stack, Cluster } from '@/app/(frontend)/components/layout'
import { Card } from '@/app/(frontend)/components/ui/card'
import { Button } from '@/app/(frontend)/components/ui/button'
import { Badge } from '@/app/(frontend)/components/ui/badge'
import { CreditCard, ExternalLink, AlertCircle, CheckCircle, XCircle } from 'lucide-react'

interface BillingInfoProps {
  hasBillingInfo: boolean
  onOpenPortal?: () => void
}

export function BillingInfo({ hasBillingInfo, onOpenPortal }: BillingInfoProps) {
  const [isOpeningPortal, setIsOpeningPortal] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const handleOpenPortal = async () => {
    setIsOpeningPortal(true)
    try {
      const response = await fetch('/api/stripe/customer-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          returnUrl: `${window.location.origin}/dashboard/settings/billing`,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        window.location.href = data.url
      } else {
        showMessage('error', data.error || 'Failed to open billing portal')
      }
    } catch (error) {
      console.error('Error opening billing portal:', error)
      showMessage('error', 'Failed to open billing portal')
    } finally {
      setIsOpeningPortal(false)
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
        <h2 className="heading-3">Billing Information</h2>
        <p className="body-lg mt-2">Manage your payment methods and billing details</p>
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

      {/* Billing Card */}
      <m.div
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={viewport}
        transition={{ duration: 0.24, delay: 0.05 }}
        {...hoverLift}
      >
        <Card className="p-6">
          <Stack space="md">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-brand/10 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-brand" />
              </div>
              <div>
                <h3 className="font-semibold">Payment Methods</h3>
                <p className="text-sm text-muted-foreground">
                  Manage your payment methods and billing preferences
                </p>
              </div>
            </div>

            {hasBillingInfo ? (
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Billing Portal Access</p>
                      <p className="text-sm text-muted-foreground">
                        Update payment methods, view invoices, and manage billing
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    >
                      Active
                    </Badge>
                  </div>
                </div>

                <Button
                  onClick={handleOpenPortal}
                  disabled={isOpeningPortal}
                  className="w-full sm:w-auto"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {isOpeningPortal ? 'Opening Portal...' : 'Manage Billing'}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 dark:bg-amber-950 dark:border-amber-800">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-800 dark:text-amber-200">
                        No Billing Information
                      </p>
                      <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                        You don't have any billing information yet. Subscribe to a plan to access
                        billing management.
                      </p>
                    </div>
                  </div>
                </div>

                <Button asChild className="w-full sm:w-auto">
                  <a href="/pricing">
                    <CreditCard className="mr-2 h-4 w-4" />
                    View Plans
                  </a>
                </Button>
              </div>
            )}

            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Billing portal is powered by Stripe. All payments are secure and encrypted.
              </p>
            </div>
          </Stack>
        </Card>
      </m.div>
    </Stack>
  )
}
