import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { LoginForm } from './LoginForm'
import { SectionWrapper } from '../components/layout/section'
import { AuthRedirect } from './AuthRedirect'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ planId?: string; trial?: string; next?: string; finalNext?: string }>
}) {
  const { planId, trial, next, finalNext } = await searchParams
  const headersList = await headers()
  const payload = await getPayload({ config })

  let user = null
  let redirectUrl = null

  try {
    const authResult = await payload.auth({ headers: headersList })
    user = authResult.user

    if (user) {
      // If there are parameters for the unified start flow, redirect to post-login
      if (planId || trial || finalNext) {
        const params = new URLSearchParams()
        if (planId) params.set('planId', planId)
        if (trial) params.set('trial', trial)
        if (finalNext) params.set('finalNext', finalNext)
        redirectUrl = `/post-login?${params.toString()}`
      }
      // If there's a next parameter, redirect there
      else if (next) {
        redirectUrl = next
      }
      // Default redirect based on role
      else if (user.role === 'admin') {
        redirectUrl = '/admin'
      } else {
        redirectUrl = '/dashboard'
      }
    }
  } catch (error) {
    // User not authenticated, continue to login form
  }

  // If we have a redirect URL, show the redirect component
  if (redirectUrl) {
    return <AuthRedirect url={redirectUrl} />
  }

  return (
    <SectionWrapper bg="gradient" padding="loose" fullWidth>
      <div className="mx-auto max-w-md px-6">
        <div className="text-center mb-8">
          <h1 className="heading-2 text-foreground">Sign in to your account</h1>

          {next === '/admin' && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                You need admin access to view this page. Please sign in with an admin account.
              </p>
            </div>
          )}

          {planId && (
            <div className="mt-4 p-4 bg-brand/10 border border-brand/20 rounded-lg">
              <p className="text-sm text-brand-foreground">
                You're almost there—log in to complete checkout for the selected plan.
              </p>
            </div>
          )}

          {trial && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700">
                Create your account to start your free trial.
              </p>
            </div>
          )}

          <p className="mt-4 body-lg">
            Or{' '}
            <a
              href={`/signup?${new URLSearchParams({
                ...(planId && { planId }),
                ...(trial && { trial }),
                ...(next && { next }),
                ...(finalNext && { finalNext }),
              }).toString()}`}
              className="font-medium text-brand hover:text-brand/80 transition-colors"
            >
              create a new account
            </a>
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg shadow-soft p-8">
          <LoginForm />
        </div>
      </div>
    </SectionWrapper>
  )
}
