'use client'

import '../../styles.css'
import { SectionWrapper } from '../../components/layout/section'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { XCircle, ArrowLeft, CreditCard } from 'lucide-react'
import Link from 'next/link'

export default function BillingCanceledPage() {
  return (
    <SectionWrapper bg="gradient" padding="loose" fullWidth>
      <div className="mx-auto max-w-2xl px-6">
        <Card className="p-8 md:p-12 text-center border-0 shadow-soft">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-6">
              <XCircle className="h-10 w-10 text-orange-600" />
            </div>
            <h1 className="heading-1 text-foreground mb-4">Payment Canceled</h1>
            <p className="body-lg text-muted-foreground max-w-md mx-auto">
              Your payment was canceled. No charges were made to your account and your subscription
              remains unchanged.
            </p>
          </div>

          <div className="mb-8">
            <div className="bg-muted/50 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  Transaction Status
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                The payment process was interrupted and no charges were processed.
              </p>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm text-orange-800">
                💡 Need help? You can try again anytime or contact our support team.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <Button asChild size="lg" className="w-full md:w-auto">
              <Link href="/pricing" className="flex items-center">
                <ArrowLeft className="mr-2 h-4 w-4" />
                View Plans
              </Link>
            </Button>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild variant="outline" size="lg">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
              <Button asChild variant="ghost" size="lg">
                <Link href="/contact">Contact Support</Link>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </SectionWrapper>
  )
}
