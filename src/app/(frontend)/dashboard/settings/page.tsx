'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardSettingsPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/dashboard/settings/account')
  }, [router])

  return null
}
