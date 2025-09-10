'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Checkbox } from '../components/ui/checkbox'
import { PasswordStrength } from '../components/ui/password-strength'
import { m, useFadeInUpVariants, viewport } from '@/lib/motion'

interface SignupFormProps {
  planId?: string
  trial?: string
  next?: string
  finalNext?: string
}

export function SignupForm({ planId, trial, next, finalNext }: SignupFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    acceptMarketing: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const router = useRouter()
  const searchParams = useSearchParams()

  // Debug: Log props received by SignupForm
  console.log('SignupForm received props:', { planId, trial, next, finalNext })
  console.log('SignupForm props types:', {
    planId: typeof planId,
    trial: typeof trial,
    next: typeof next,
    finalNext: typeof finalNext,
  })

  const title = useFadeInUpVariants({ distance: 16, duration: 0.32 })
  const form = useFadeInUpVariants({ distance: 10, duration: 0.3, delay: 0.05 })

  const handleInputChange = (field: string, value: string | boolean) => {
    console.log('Input change:', field, value) // Debug log
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError('') // Clear general error when user starts typing
    setFieldErrors((prev) => ({ ...prev, [field]: '' })) // Clear field-specific error
  }

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError('First name is required')
      return false
    }
    if (!formData.lastName.trim()) {
      setError('Last name is required')
      return false
    }
    if (!formData.email.trim()) {
      setError('Email is required')
      return false
    }
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address')
      return false
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    if (!formData.acceptTerms) {
      setError('You must accept the terms and conditions')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted!') // Debug log

    if (!validateForm()) {
      console.log('Form validation failed') // Debug log
      return
    }

    setIsLoading(true)
    setError('')
    setFieldErrors({}) // Clear all field errors

    try {
      console.log('Submitting signup form:', {
        email: formData.email,
        firstName: formData.firstName,
      })

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          acceptMarketing: formData.acceptMarketing,
          originalDestination: finalNext || next || (planId ? `/pricing?planId=${planId}` : null),
        }),
      })

      console.log('Signup response status:', response.status)

      if (response.ok) {
        const data = await response.json()

        // Redirect to check-email page after successful signup
        console.log('Signup successful, redirecting to check-email page')
        router.push('/check-email')
      } else {
        const data = await response.json()

        // Handle field-specific errors
        if (data.field && data.field !== 'general') {
          setFieldErrors((prev) => ({ ...prev, [data.field]: data.error }))
          setError('') // Clear general error

          // Focus on the field with error
          const fieldElement = document.getElementById(data.field)
          if (fieldElement) {
            fieldElement.focus()
          }
        } else {
          // Handle general errors
          setError(data.error || 'Signup failed. Please try again.')
          setFieldErrors({}) // Clear field errors
        }
      }
    } catch (err) {
      console.error('Signup error:', err)
      setError('An unexpected error occurred. Please try again.')
      setFieldErrors({})
    } finally {
      setIsLoading(false)
      // Clear field errors after a delay to allow user to see them
      setTimeout(() => {
        setFieldErrors({})
      }, 8000) // Increased timeout for better UX
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
      <div className="grid grid-cols-2 gap-4">
        <m.div variants={title}>
          <Label htmlFor="firstName" className="text-sm font-medium text-foreground">
            First name
          </Label>
          <Input
            id="firstName"
            name="firstName"
            type="text"
            autoComplete="given-name"
            required
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            className="mt-2"
            placeholder="Enter your first name"
            disabled={isLoading}
          />
        </m.div>

        <m.div variants={title}>
          <Label htmlFor="lastName" className="text-sm font-medium text-foreground">
            Last name
          </Label>
          <Input
            id="lastName"
            name="lastName"
            type="text"
            autoComplete="family-name"
            required
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            className="mt-2"
            placeholder="Enter your last name"
            disabled={isLoading}
          />
        </m.div>
      </div>

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
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          className={`mt-2 ${
            fieldErrors.email
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50'
              : ''
          }`}
          placeholder="Enter your email"
          disabled={isLoading}
        />
        {fieldErrors.email && (
          <div className="mt-1">
            <p className="text-sm text-red-600">{fieldErrors.email}</p>
            {fieldErrors.email.includes('already exists') && (
              <p className="mt-1 text-sm text-red-600">
                <a href="/login" className="text-red-700 hover:text-red-800 underline font-medium">
                  Click here to log in instead →
                </a>
              </p>
            )}
          </div>
        )}
      </m.div>

      <m.div variants={title}>
        <Label htmlFor="password" className="text-sm font-medium text-foreground">
          Password
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          value={formData.password}
          onChange={(e) => handleInputChange('password', e.target.value)}
          className="mt-2"
          placeholder="Create a strong password"
          disabled={isLoading}
        />
        {formData.password && (
          <div className="mt-3">
            <PasswordStrength password={formData.password} />
          </div>
        )}
      </m.div>

      <m.div variants={title}>
        <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
          Confirm password
        </Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          value={formData.confirmPassword}
          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
          className="mt-2"
          placeholder="Confirm your password"
          disabled={isLoading}
        />
      </m.div>

      <m.div variants={title} className="space-y-4">
        <div className="flex items-start space-x-2">
          <Checkbox
            id="acceptTerms"
            checked={formData.acceptTerms}
            onCheckedChange={(checked) => handleInputChange('acceptTerms', checked as boolean)}
            disabled={isLoading}
          />
          <Label htmlFor="acceptTerms" className="text-sm text-muted-foreground leading-relaxed">
            I agree to the{' '}
            <a href="/terms" className="text-brand hover:text-brand/80 transition-colors">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-brand hover:text-brand/80 transition-colors">
              Privacy Policy
            </a>
          </Label>
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox
            id="acceptMarketing"
            checked={formData.acceptMarketing}
            onCheckedChange={(checked) => handleInputChange('acceptMarketing', checked as boolean)}
            disabled={isLoading}
          />
          <Label
            htmlFor="acceptMarketing"
            className="text-sm text-muted-foreground leading-relaxed"
          >
            I'd like to receive product updates and marketing communications
          </Label>
        </div>
      </m.div>

      {error && (
        <m.div variants={title} className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </m.div>
      )}

      <m.div variants={title}>
        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
          {isLoading ? 'Creating account...' : 'Create account'}
        </Button>
      </m.div>

      <m.div variants={title} className="text-center">
        <p className="text-xs text-muted-foreground">
          By creating an account, you agree to our terms and privacy policy.
        </p>
      </m.div>
    </m.form>
  )
}
