import { SectionWrapper } from '../components/layout/section'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function AdminAccessDeniedPage() {
  return (
    <SectionWrapper bg="gradient" padding="loose" fullWidth>
      <div className="mx-auto max-w-md px-6">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <Shield className="h-8 w-8 text-red-600" />
          </div>

          <h1 className="heading-2 text-foreground">Admin Access Required</h1>

          <Card className="mt-8 p-6">
            <p className="body-lg text-muted-foreground mb-6">
              You need administrator privileges to access this page. Please contact your system
              administrator if you believe this is an error.
            </p>

            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link href="/dashboard">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Go to Dashboard
                </Link>
              </Button>

              <Button variant="outline" asChild className="w-full">
                <Link href="/">Return to Home</Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </SectionWrapper>
  )
}
