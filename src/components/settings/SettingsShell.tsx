'use client'

import { ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { m, viewport } from '@/lib/motion'
import { Stack, Cluster } from '@/app/(frontend)/components/layout'
import { Card } from '@/app/(frontend)/components/ui/card'
import { Button } from '@/app/(frontend)/components/ui/button'
import { ThemeToggle } from '@/app/(frontend)/components/ui/theme-toggle'
import { User, CreditCard, Shield, ChevronRight, Settings as SettingsIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type SettingsTab = 'account' | 'billing' | 'security'

interface SettingsShellProps {
  active: SettingsTab
  children: ReactNode
  user?: {
    email: string
    firstName?: string
    lastName?: string
    role: string
    subscriptionStatus?: string
    subscriptionPlan?: string
  }
}

const tabs: Array<{
  id: SettingsTab
  label: string
  icon: React.ComponentType<{ className?: string }>
  description: string
}> = [
  {
    id: 'account',
    label: 'Account',
    icon: User,
    description: 'Manage your profile and preferences',
  },
  {
    id: 'billing',
    label: 'Billing',
    icon: CreditCard,
    description: 'Payment methods and subscription',
  },
  {
    id: 'security',
    label: 'Security',
    icon: Shield,
    description: 'Password and account security',
  },
]

export function SettingsShell({ active, children, user }: SettingsShellProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handleTabChange = (tab: SettingsTab) => {
    router.push(`/dashboard/settings/${tab}`)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <m.header
        className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={viewport}
        transition={{ duration: 0.24 }}
      >
        <div className="max-w-[1100px] mx-auto px-6 py-4">
          <Cluster justify="between" align="center">
            <div>
              <h1 className="heading-3 flex items-center gap-2">
                <SettingsIcon className="h-6 w-6 text-brand" />
                Settings
              </h1>
              <p className="body-lg mt-1">Manage your account preferences and billing</p>
            </div>
            <ThemeToggle />
          </Cluster>
        </div>
      </m.header>

      {/* Main Content */}
      <div className="max-w-[1100px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          {/* Left Sidebar */}
          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <Stack space="lg">
              {/* Account Overview */}
              {user && (
                <m.div
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={viewport}
                  transition={{ duration: 0.24, delay: 0.05 }}
                >
                  <Card className="p-4">
                    <Stack space="sm">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-brand/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-brand" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">
                            {user.firstName && user.lastName
                              ? `${user.firstName} ${user.lastName}`
                              : user.email}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-border">
                        {user.subscriptionStatus && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Plan</span>
                            <span className="font-medium">{user.subscriptionPlan || 'Free'}</span>
                          </div>
                        )}
                      </div>
                    </Stack>
                  </Card>
                </m.div>
              )}

              {/* Navigation */}
              <m.nav
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewport}
                transition={{ duration: 0.24, delay: 0.1 }}
              >
                <Card className="p-2">
                  <Stack space="xs">
                    {tabs.map((tab) => {
                      const isActive = active === tab.id
                      const Icon = tab.icon

                      return (
                        <Button
                          key={tab.id}
                          variant={isActive ? 'default' : 'ghost'}
                          className={cn(
                            'justify-start h-auto p-3',
                            isActive && 'bg-brand text-brand-foreground',
                          )}
                          onClick={() => handleTabChange(tab.id)}
                        >
                          <Icon className="h-4 w-4 mr-3" />
                          <div className="text-left">
                            <div className="font-medium">{tab.label}</div>
                            <div
                              className={cn(
                                'text-xs mt-0.5',
                                isActive ? 'text-brand-foreground/80' : 'text-muted-foreground',
                              )}
                            >
                              {tab.description}
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 ml-auto opacity-50" />
                        </Button>
                      )
                    })}
                  </Stack>
                </Card>
              </m.nav>
            </Stack>
          </aside>

          {/* Right Content Area */}
          <main className="min-w-0">
            <m.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              {children}
            </m.div>
          </main>
        </div>
      </div>
    </div>
  )
}
