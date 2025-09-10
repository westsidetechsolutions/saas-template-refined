'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SectionWrapper } from '../components/layout/section'

interface AuthRedirectProps {
  url: string
}

export function AuthRedirect({ url }: AuthRedirectProps) {
  const router = useRouter()

  useEffect(() => {
    console.log('🔄 Client-side redirecting to:', url)
    router.push(url)
  }, [url, router])

  return (
    <SectionWrapper bg="gradient" padding="loose" fullWidth>
      <div className="mx-auto max-w-md px-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mx-auto mb-4"></div>
          <h1 className="heading-2 text-foreground">Redirecting...</h1>
          <p className="body-lg text-muted-foreground mt-2">
            You're already logged in. Taking you to your dashboard.
          </p>
        </div>
      </div>
    </SectionWrapper>
  )
}
