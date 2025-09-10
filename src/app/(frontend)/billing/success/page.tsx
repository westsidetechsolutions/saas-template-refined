'use client'

import React from 'react'
import '../../styles.css'
import { SectionWrapper } from '../../components/layout/section'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, ArrowRight, CreditCard } from 'lucide-react'
import Link from 'next/link'

export default function BillingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  // Unwrap searchParams using React.use() as required by Next.js 15
  const params = React.use(searchParams)
  const sessionId = params.session_id

  return (
    <SectionWrapper bg="gradient" padding="loose" fullWidth>
      <div className="mx-auto max-w-2xl px-6">
        <Card className="p-8 md:p-12 text-center border-0 shadow-soft">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="heading-1 text-foreground mb-4">Payment Successful!</h1>
            <p className="body-lg text-muted-foreground max-w-md mx-auto">
              Thank you for your purchase. Your subscription is now active and you have full access
              to all features.
            </p>
          </div>

          <div className="mb-8">
            <div className="bg-muted/50 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  Transaction Details
                </span>
              </div>
              {sessionId ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Session ID:{' '}
                    <code className="text-xs bg-background px-2 py-1 rounded font-mono">
                      {sessionId}
                    </code>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    You'll receive a confirmation email shortly with your receipt.
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Your payment has been processed successfully.
                </p>
              )}
            </div>

            <div className="bg-brand/5 border border-brand/10 rounded-lg p-4">
              <p className="text-sm text-brand-foreground">
                🎉 Welcome aboard! You now have access to all premium features.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <Button asChild size="lg" className="w-full md:w-auto">
              <Link href="/dashboard" className="flex items-center">
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild variant="outline" size="lg">
                <Link href="/dashboard/settings">Manage Billing</Link>
              </Button>
              <Button asChild variant="ghost" size="lg">
                <Link href="/pricing">View Plans</Link>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </SectionWrapper>
  )
}
