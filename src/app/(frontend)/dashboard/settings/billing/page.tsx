'use client'

import { useState, useEffect } from 'react'
import { Stack } from '@/app/(frontend)/components/layout'
import { SettingsShell } from '@/components/settings/SettingsShell'
import { BillingInfo } from '@/components/settings/BillingInfo'
import { SubscriptionPanel } from '@/components/settings/SubscriptionPanel'

interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  role: string
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  subscriptionStatus?: string
  subscriptionPlan?: string
  planPriceId?: string
  subscriptionCurrentPeriodEnd?: string
}

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

export default function DashboardBillingSettingsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [currentProduct, setCurrentProduct] = useState<StripePlan | null>(null)
  const [availablePlans, setAvailablePlans] = useState<StripePlan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserData()
    fetchAvailablePlans()
  }, [])

  useEffect(() => {
    if (user?.planPriceId) {
      fetchCurrentProduct()
    }
  }, [user?.planPriceId])

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        console.error('Failed to fetch user data:', response.status)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailablePlans = async () => {
    try {
      const response = await fetch('/api/stripe/plans')
      if (response.ok) {
        const plans: StripePlan[] = await response.json()
        const formattedPlans = plans.map((plan) => {
          const features = plan.metadata?.features?.split(',') || []
          const price = plan.default_price?.unit_amount || 0
          const isHighlight = plan.metadata?.highlight === 'true'

          return {
            id: plan.id,
            name: plan.name,
            description: plan.description || '',
            metadata: plan.metadata,
            default_price: plan.default_price,
            features,
            price,
            highlight: isHighlight,
          }
        })
        setAvailablePlans(formattedPlans)
      } else {
        console.error('Error fetching plans:', response.status)
      }
    } catch (error) {
      console.error('Error fetching plans:', error)
    }
  }

  const fetchCurrentProduct = async () => {
    if (!user?.planPriceId) return

    try {
      const response = await fetch(`/api/stripe/product?priceId=${user.planPriceId}`)
      if (response.ok) {
        const product: StripePlan = await response.json()
        const features = product.metadata?.features?.split(',') || []
        const price = product.default_price?.unit_amount || 0
        const isHighlight = product.metadata?.highlight === 'true'

        setCurrentProduct({
          id: product.id,
          name: product.name,
          description: product.description || '',
          metadata: product.metadata,
          default_price: product.default_price,
          features,
          price,
          highlight: isHighlight,
        })
      } else {
        console.error('Error fetching current product:', response.status)
      }
    } catch (error) {
      console.error('Error fetching current product:', error)
    }
  }

  const handlePlanChange = async (newPlan: string) => {
    // Refresh user data and current product after plan change
    await fetchUserData()
    await fetchCurrentProduct()
  }

  const handleCancelSubscription = async () => {
    // Refresh user data after subscription cancellation
    await fetchUserData()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="heading-2">Access Denied</h2>
          <p className="body-lg text-muted-foreground">
            You need to be logged in to view settings.
          </p>
        </div>
      </div>
    )
  }

  const hasBillingInfo = user.stripeCustomerId || user.stripeSubscriptionId

  return (
    <SettingsShell active="billing" user={user}>
      <Stack space="xl">
        <BillingInfo hasBillingInfo={hasBillingInfo} />
        <SubscriptionPanel
          user={user}
          currentProduct={currentProduct}
          availablePlans={availablePlans}
          onPlanChange={handlePlanChange}
          onCancelSubscription={handleCancelSubscription}
        />
      </Stack>
    </SettingsShell>
  )
}
