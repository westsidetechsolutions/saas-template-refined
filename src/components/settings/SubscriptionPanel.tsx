'use client'

import { useState } from 'react'
import { m, viewport, hoverLift } from '@/lib/motion'
import { Stack, Cluster } from '@/app/(frontend)/components/layout'
import { Card } from '@/app/(frontend)/components/ui/card'
import { Button } from '@/app/(frontend)/components/ui/button'
import { Badge } from '@/app/(frontend)/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/(frontend)/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/app/(frontend)/components/ui/dialog'
import {
  AlertTriangle,
  ExternalLink,
  ChevronDown,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
} from 'lucide-react'

interface StripePlan {
  id: string
  name: string
  description: string
  metadata: Record<string, string>
  default_price: {
    id?: string
    unit_amount: number
    currency: string
    recurring?: { interval: string }
  }
  features: string[]
  price: number
  highlight: boolean
}

interface SubscriptionPanelProps {
  user: {
    stripeSubscriptionId?: string
    subscriptionStatus?: string
    subscriptionPlan?: string
    planPriceId?: string
    subscriptionCurrentPeriodEnd?: string
  }
  currentProduct?: StripePlan
  availablePlans: StripePlan[]
  onPlanChange?: (newPlan: string) => void
  onCancelSubscription?: () => void
}

export function SubscriptionPanel({
  user,
  currentProduct,
  availablePlans,
  onPlanChange,
  onCancelSubscription,
}: SubscriptionPanelProps) {
  const [showPlanChange, setShowPlanChange] = useState(false)
  const [selectedNewPlan, setSelectedNewPlan] = useState<string>('')
  const [changingPlan, setChangingPlan] = useState(false)
  const [isCancelingSubscription, setIsCancelingSubscription] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const formatPrice = (price: number, currency: string = 'usd') => {
    if (price === 0) {
      return 'Free'
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(price / 100)
  }

  const getStatusBadge = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            Active
          </Badge>
        )
      case 'canceled':
      case 'cancelled':
        return (
          <Badge
            variant="secondary"
            className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
          >
            Cancelled
          </Badge>
        )
      case 'past_due':
        return <Badge variant="destructive">Past Due</Badge>
      case 'unpaid':
        return <Badge variant="destructive">Unpaid</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const handleChangePlan = async () => {
    if (!selectedNewPlan) {
      showMessage('error', 'Please select a new plan')
      return
    }

    setChangingPlan(true)
    try {
      const response = await fetch('/api/stripe/change-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newPriceId: selectedNewPlan,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        showMessage('success', `Plan changed to ${data.newPlan} successfully!`)
        setShowPlanChange(false)
        setSelectedNewPlan('')
        onPlanChange?.(selectedNewPlan)
      } else {
        showMessage('error', data.error || 'Failed to change plan')
      }
    } catch (error) {
      console.error('Error changing plan:', error)
      showMessage('error', 'Failed to change plan')
    } finally {
      setChangingPlan(false)
    }
  }

  const handleCancelSubscription = async () => {
    setIsCancelingSubscription(true)
    try {
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: user.stripeSubscriptionId,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        showMessage('success', 'Subscription cancelled successfully!')
        setShowCancelDialog(false)
        onCancelSubscription?.()
      } else {
        showMessage('error', data.error || 'Failed to cancel subscription')
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error)
      showMessage('error', 'Failed to cancel subscription')
    } finally {
      setIsCancelingSubscription(false)
    }
  }

  if (!user.stripeSubscriptionId) {
    return null
  }

  return (
    <Stack space="lg">
      {/* Header */}
      <m.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={viewport}
        transition={{ duration: 0.28, delay: 0.1 }}
      >
        <h2 className="heading-3">Subscription Management</h2>
        <p className="body-lg mt-2">Manage your current plan and subscription settings</p>
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

      {/* Current Plan Card */}
      <m.div
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={viewport}
        transition={{ duration: 0.24, delay: 0.15 }}
        {...hoverLift}
      >
        <Card className="p-6">
          <Stack space="md">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-brand/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-brand" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Current Plan</h3>
                <p className="text-sm text-muted-foreground">
                  Your subscription details and billing information
                </p>
              </div>
              {getStatusBadge(user.subscriptionStatus)}
            </div>

            {/* Plan Details */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Plan</span>
                <span className="font-medium">
                  {currentProduct?.name || user.subscriptionPlan || 'Unknown Plan'}
                </span>
              </div>

              {currentProduct && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Price</span>
                  <span className="font-medium">
                    {formatPrice(currentProduct.price, currentProduct.default_price?.currency)}
                    {currentProduct.price > 0 &&
                      currentProduct.default_price?.recurring?.interval && (
                        <span className="text-muted-foreground">
                          /{currentProduct.default_price.recurring.interval}
                        </span>
                      )}
                  </span>
                </div>
              )}

              {user.subscriptionCurrentPeriodEnd && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Next billing</span>
                  <span className="font-medium">
                    {new Date(user.subscriptionCurrentPeriodEnd).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <Cluster justify="start" wrap>
              <Button
                variant="outline"
                onClick={() => setShowPlanChange(!showPlanChange)}
                className="flex items-center gap-2"
              >
                Change Plan
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${showPlanChange ? 'rotate-180' : ''}`}
                />
              </Button>

              <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950"
                  >
                    Cancel Subscription
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Cancel Subscription</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to cancel your subscription? You'll continue to have
                      access until the end of your current billing period.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                      Keep Subscription
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleCancelSubscription}
                      disabled={isCancelingSubscription}
                    >
                      {isCancelingSubscription ? 'Canceling...' : 'Cancel Subscription'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </Cluster>

            {/* Plan Change Section */}
            {showPlanChange && (
              <m.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border border-border rounded-lg p-4 bg-muted/30"
              >
                <h4 className="font-medium mb-3">Select New Plan</h4>
                <Stack space="md">
                  <Select value={selectedNewPlan} onValueChange={setSelectedNewPlan}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a plan..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePlans
                        .filter((plan) => plan.default_price?.id !== user.planPriceId)
                        .map((plan) => (
                          <SelectItem
                            key={plan.default_price?.id}
                            value={plan.default_price?.id || ''}
                          >
                            {plan.name} - {formatPrice(plan.price, plan.default_price?.currency)}
                            {plan.price > 0 && plan.default_price?.recurring?.interval && (
                              <span>/{plan.default_price.recurring.interval}</span>
                            )}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>

                  {selectedNewPlan && (
                    <Cluster justify="start" wrap>
                      <Button onClick={handleChangePlan} disabled={changingPlan}>
                        {changingPlan ? 'Changing...' : 'Change to Selected Plan'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedNewPlan('')
                          setShowPlanChange(false)
                        }}
                      >
                        Cancel
                      </Button>
                    </Cluster>
                  )}
                </Stack>
              </m.div>
            )}

            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Canceling your subscription will stop future charges. You'll continue to have access
                until the end of your current billing period.
              </p>
            </div>
          </Stack>
        </Card>
      </m.div>
    </Stack>
  )
}
