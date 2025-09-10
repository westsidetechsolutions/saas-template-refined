'use client'

import { useState, useEffect } from 'react'
import { SettingsShell } from '@/components/settings/SettingsShell'
import { AccountForm } from '@/components/settings/AccountForm'

interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  role: string
  subscriptionStatus?: string
  subscriptionPlan?: string
  _verified?: boolean
}

export default function DashboardAccountSettingsPage() {
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

  const handleUserUpdate = (updatedUser: User) => {
    setUser(updatedUser)
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
    <SettingsShell active="account" user={user}>
      <AccountForm user={user} onUpdate={handleUserUpdate} />
    </SettingsShell>
  )
}
