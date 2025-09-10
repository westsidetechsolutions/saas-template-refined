'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { getServiceById } from '../data/services'

export default function ConfirmationPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const serviceId = searchParams.get('service')
  const address = searchParams.get('address')
  const date = searchParams.get('date')
  const time = searchParams.get('time')

  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  const service = serviceId ? getServiceById(serviceId) : null
  const depositAmount = 50

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const handlePayDeposit = async () => {
    setIsProcessing(true)

    // Simulate payment processing
    setTimeout(() => {
      // Simulate successful payment
      setPaymentSuccess(true)
      setIsProcessing(false)

      // Navigate to final confirmation after 1 second
      setTimeout(() => {
        const params = new URLSearchParams({
          service: serviceId || '',
          address: address || '',
          date: date || '',
          time: time || '',
        })
        router.push(`/scheduler/success?${params.toString()}`)
      }, 1000)
    }, 1500)
  }

  if (!service || !address || !date || !time) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Missing Information</h1>
          <p className="text-gray-600">Please complete the booking process from the beginning.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Confirm Your Booking</h1>
          <p className="text-lg text-gray-600">
            Review your appointment details and pay your deposit
          </p>
        </div>

        {/* Booking Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking Summary</h2>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-600">Service:</span>
              <span className="font-medium">{service.name}</span>
            </div>

            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-600">Address:</span>
              <span className="font-medium text-right max-w-xs">{address}</span>
            </div>

            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">{formatDate(date)}</span>
            </div>

            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-600">Time:</span>
              <span className="font-medium">{time}</span>
            </div>

            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-600">Service Duration:</span>
              <span className="font-medium">{service.duration} hours</span>
            </div>

            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-600">Total Service Cost:</span>
              <span className="font-medium">${service.price}</span>
            </div>
          </div>
        </div>

        {/* Deposit Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Deposit Required</h2>
            <span className="text-2xl font-bold text-blue-600">${depositAmount}</span>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-blue-400 mr-2 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="text-blue-800 font-medium">Deposit secures your appointment</p>
                <p className="text-blue-700 text-sm mt-1">
                  A ${depositAmount} deposit is required to confirm your booking. This helps prevent
                  no-shows and secures your time slot.
                </p>
              </div>
            </div>
          </div>

          {!paymentSuccess ? (
            <button
              onClick={handlePayDeposit}
              disabled={isProcessing}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                'Pay Now'
              )}
            </button>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-green-400 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-green-800 font-medium">Payment successful! Redirecting...</p>
              </div>
            </div>
          )}
        </div>

        {/* Demo Information */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Deposit System</h3>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>
              • <strong>${depositAmount} deposit required</strong> — secures your appointment
            </li>
            <li>
              • <strong>Prevents no-shows</strong> — customers are more likely to show up when
              they've paid
            </li>
            <li>
              • <strong>Stripe Checkout</strong> — secure payment with Apple Pay/Google Pay support
            </li>
            <li>
              • <strong>Remaining balance</strong> — ${service.price - depositAmount} due on service
              completion
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
