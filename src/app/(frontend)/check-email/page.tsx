import { CheckCircle, Mail, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function CheckEmailPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-6">
            <Mail className="h-8 w-8 text-blue-600" />
          </div>

          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Check your email</h1>

          <p className="text-gray-600 mb-6">
            We've sent you a verification link to confirm your email address. Please check your
            inbox and click the link to complete your registration.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">What happens next?</p>
                <ul className="space-y-1 text-blue-700">
                  <li>• Check your email inbox (and spam folder)</li>
                  <li>• Click the verification link in the email</li>
                  <li>• Return here to log in with your new account</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Link
              href="/login"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Go to login
            </Link>

            <div className="text-sm text-gray-500">
              <p>Didn't receive the email?</p>
              <p className="mt-1">
                <Link href="/login" className="text-blue-600 hover:text-blue-500">
                  Try signing up again
                </Link>{' '}
                or{' '}
                <Link href="/forgot-password" className="text-blue-600 hover:text-blue-500">
                  contact support
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
