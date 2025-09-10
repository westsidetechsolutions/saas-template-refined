'use client'
import { useState } from 'react'

export function ResendVerifyEmailButton() {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function handleClick() {
    setState('sending')
    try {
      const res = await fetch('/api/auth/resend-verification', { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        if (data.alreadyVerified) {
          setState('error')
          // You might want to show a different message for already verified users
          return
        }
        setState('sent')
      } else {
        setState('error')
      }
    } catch (error) {
      console.error('Error resending verification email:', error)
      setState('error')
    }
  }

  return (
    <button
      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      onClick={handleClick}
      disabled={state === 'sending' || state === 'sent'}
    >
      {state === 'idle' && 'Resend verification email'}
      {state === 'sending' && (
        <>
          <svg
            className="animate-spin -ml-1 mr-3 h-4 w-4 text-gray-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Sending…
        </>
      )}
      {state === 'sent' && (
        <>
          <svg
            className="w-4 h-4 mr-2 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Sent ✔
        </>
      )}
      {state === 'error' && 'Error — try again'}
    </button>
  )
}
