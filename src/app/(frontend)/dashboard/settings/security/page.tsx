'use client'

import { useState, useEffect } from 'react'
import { Stack } from '@/app/(frontend)/components/layout'
import { SettingsShell } from '@/components/settings/SettingsShell'
import { ChangePassword } from '@/components/settings/ChangePassword'
import { DeleteAccount } from '@/components/settings/DeleteAccount'

interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  role: string
  subscriptionStatus?: string
  subscriptionPlan?: string
}

export default function DashboardSecuritySettingsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserData()
  }, [])

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

  return (
    <SettingsShell active="security" user={user}>
      <Stack space="xl">
        <ChangePassword />
        <DeleteAccount />
      </Stack>
    </SettingsShell>
  )
}
