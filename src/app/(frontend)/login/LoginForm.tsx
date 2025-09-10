'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { m, useFadeInUpVariants, viewport } from '@/lib/motion'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const [successMessage, setSuccessMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  // Check for pre-filled email from verification
  useEffect(() => {
    const verifiedEmail = searchParams.get('email')
    const verified = searchParams.get('verified')

    if (verifiedEmail) {
      setEmail(verifiedEmail)
    }

    if (verified === 'true') {
      setSuccessMessage('Email verified successfully! You can now log in.')
    }
  }, [searchParams])

  const title = useFadeInUpVariants({ distance: 16, duration: 0.32 })
  const form = useFadeInUpVariants({ distance: 10, duration: 0.3, delay: 0.05 })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const { user } = await response.json()

        // Check for unified start flow parameters
        const planId = searchParams.get('planId')
        const trial = searchParams.get('trial')
        const next = searchParams.get('next')
        const finalNext = searchParams.get('finalNext')

        console.log('Login successful, checking redirect parameters:', {
          planId,
          trial,
          next,
          finalNext,
        })

        // If we have plan parameters, redirect to post-login to continue the flow
        if (planId || trial || finalNext) {
          const postLoginUrl = new URL('/post-login', window.location.origin)
          if (planId) postLoginUrl.searchParams.set('planId', planId)
          if (trial) postLoginUrl.searchParams.set('trial', trial)
          if (finalNext) postLoginUrl.searchParams.set('finalNext', finalNext)

          console.log('Redirecting to post-login with URL:', postLoginUrl.toString())
          router.push(postLoginUrl.toString())
        } else if (next) {
          // Handle regular next parameter
          console.log('Redirecting to next:', next)
          router.push(next)
        } else if (user.role === 'admin') {
          router.push('/admin')
        } else {
          // Smart redirect based on subscription status
          try {
            console.log('🔍 Starting smart redirect check...')
            const statusResponse = await fetch('/api/auth/user-status', {
              headers: {
                'Content-Type': 'application/json',
              },
            })

            console.log('📡 Status response status:', statusResponse.status)

            if (statusResponse.ok) {
              const { user: userStatus, globalSettings } = await statusResponse.json()

              console.log('📊 User status data:', {
                hasActiveSubscription: userStatus.hasActiveSubscription,
                subscriptionStatus: userStatus.subscriptionStatus,
                subscriptionCurrentPeriodEnd: userStatus.subscriptionCurrentPeriodEnd,
                role: userStatus.role,
              })

              console.log('⚙️ Global settings:', globalSettings)

              if (userStatus.hasActiveSubscription) {
                // User has active subscription - go to dashboard
                console.log('✅ User has active subscription, redirecting to dashboard')
                router.push('/dashboard')
              } else {
                // User has no active subscription - go to pricing
                console.log('❌ User has no active subscription, redirecting to pricing')
                console.log('📍 Pricing URL:', globalSettings.pricingRedirectUrl)
                router.push(globalSettings.pricingRedirectUrl)
              }
            } else {
              // Fallback to dashboard if status check fails
              console.log('⚠️ Status check failed, fallback to dashboard')
              const errorText = await statusResponse.text()
              console.log('❌ Status response error:', errorText)
              router.push('/dashboard')
            }
          } catch (error) {
            // Fallback to dashboard if status check fails
            console.log('💥 Status check error, fallback to dashboard:', error)
            router.push('/dashboard')
          }
        }
      } else {
        const data = await response.json()
        // Handle different error response formats
        const errorMessage =
          data.errors?.[0]?.message || data.error || 'Login failed. Please try again.'
        setError(errorMessage)
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <m.form
      onSubmit={handleSubmit}
      initial="hidden"
      whileInView="show"
      viewport={viewport}
      variants={form}
      className="space-y-6"
    >
      <m.div variants={title}>
        <Label htmlFor="email" className="text-sm font-medium text-foreground">
          Email address
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-2"
          placeholder="Enter your email"
          disabled={isLoading}
        />
      </m.div>

      <m.div variants={title}>
        <Label htmlFor="password" className="text-sm font-medium text-foreground">
          Password
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2"
          placeholder="Enter your password"
          disabled={isLoading}
        />
      </m.div>

      {successMessage && (
        <m.div variants={title} className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700">{successMessage}</p>
        </m.div>
      )}

      {/* Always show error if it exists */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-xs font-bold">!</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm text-red-700 font-medium">Login Failed</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
              {error.toLowerCase().includes('password') && (
                <a
                  href="/forgot-password"
                  className="text-sm text-red-600 hover:text-red-700 underline mt-2 inline-block"
                >
                  Forgot your password?
                </a>
              )}
              {error.toLowerCase().includes('locked') && (
                <div className="mt-2">
                  <p className="text-sm text-red-600">
                    Your account has been temporarily locked due to multiple failed login attempts.
                  </p>
                  <a
                    href="/forgot-password"
                    className="text-sm text-red-600 hover:text-red-700 underline mt-1 inline-block"
                  >
                    Reset your password to unlock your account
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <m.div variants={title}>
        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign in'}
        </Button>
      </m.div>

      <m.div variants={title} className="text-center">
        <a
          href="/forgot-password"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Forgot your password?
        </a>
      </m.div>
    </m.form>
  )
}
