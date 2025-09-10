import React from 'react'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { Sidebar } from '../components/layout/Sidebar'
import { ThemeBoot } from '../theme-boot'
import { checkUserSubscription } from '@/lib/subscription'
import '../styles.css'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers()
  const payload = await getPayload({ config })

  try {
    const { user } = await payload.auth({ headers: headersList })

    if (!user) {
      redirect('/login')
    }

    // If user is admin, redirect to admin panel
    if (user.role === 'admin') {
      redirect('/admin')
    }

    // Check if user has an active subscription
    const subscriptionCheck = checkUserSubscription(user)

    if (!subscriptionCheck.hasActiveSubscription) {
      console.log('🚫 User without subscription tried to access dashboard:', user.email)
      console.log('🔒 Dashboard access check:', {
        userId: user.id,
        email: user.email,
        subscriptionStatus: subscriptionCheck.subscriptionStatus,
        subscriptionCurrentPeriodEnd: subscriptionCheck.subscriptionCurrentPeriodEnd,
        currentPeriodEnd: subscriptionCheck.currentPeriodEnd?.toISOString(),
        now: new Date().toISOString(),
        isActive: subscriptionCheck.isActive,
        isCanceledButActive: subscriptionCheck.isCanceledButActive,
        hasActiveSubscription: subscriptionCheck.hasActiveSubscription,
      })
      redirect('/#pricing')
    }

    // Serialize user object to remove any functions that might cause Client Component issues
    const serializedUser = {
      id: user.id,
      email: user.email,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      role: user.role || 'user',
    }

    return (
      <html lang="en" className="bg-background text-foreground" suppressHydrationWarning>
        <head>
          {/* Set theme instantly to avoid flash */}
          <ThemeBoot />
        </head>
        <body className="flex min-h-screen flex-col antialiased">
          <div className="min-h-screen bg-background">
            <Sidebar user={serializedUser} />
            <div className="md:ml-64 p-4 pt-20 md:pt-4">{children}</div>
          </div>
        </body>
      </html>
    )
  } catch (error) {
    console.error('Dashboard layout auth error:', error)
    redirect('/login')
  }
}
