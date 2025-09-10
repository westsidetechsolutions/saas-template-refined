import 'server-only'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { redirect } from 'next/navigation'

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const params = await searchParams
  const token = params?.token
  let ok = false

  if (token) {
    try {
      console.log('Attempting to verify token:', token)

      const payload = await getPayload({ config })

      // Call Payload's verification directly
      const result = await payload.verifyEmail({
        collection: 'users',
        token,
      })

      console.log('Verification successful! Result:', result)
      ok = true

      // After successful verification, automatically log the user in
      // We need to find the user by the token and create a session
      try {
        // Find the user that was just verified
        const users = await payload.find({
          collection: 'users',
          where: {
            _verificationToken: {
              equals: token,
            },
          },
          limit: 1,
        })

        if (users.docs.length > 0) {
          const user = users.docs[0]
          console.log('Found verified user:', user.email)

          // Create a login session for the user
          const loginResult = await payload.login({
            collection: 'users',
            data: {
              email: user.email,
              // We can't get the password from the verification, so we'll need to handle this differently
            },
          })

          if (loginResult.token) {
            console.log('Auto-login successful, redirecting to dashboard')
            // Redirect to dashboard or the intended destination
            redirect('/dashboard')
          }
        }
      } catch (loginError) {
        console.error('Auto-login failed:', loginError)
        // Continue to show success page, user can log in manually
      }
    } catch (error: any) {
      console.error('Verification error:', error)
      ok = false
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8">
        {ok ? (
          <>
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">Email verified 🎉</h1>
              <p className="text-gray-600 mb-6">Your email is confirmed. You can log in now.</p>
              <a
                href="/login"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Go to login
              </a>
            </div>
          </>
        ) : (
          <>
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">Verification failed</h1>
              <p className="text-gray-600 mb-6">The verification link is invalid or expired.</p>
              <a
                href="/login"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back to login
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
