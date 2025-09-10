'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { getServiceById } from '../data/services'

export default function AddressPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const serviceId = searchParams.get('service')
  const [address, setAddress] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<{
    valid: boolean
    message: string
  } | null>(null)
  const [showBadExample, setShowBadExample] = useState(false)

  const service = serviceId ? getServiceById(serviceId) : null

  // Mock address suggestions
  const mockSuggestions = [
    '123 Main St, New York, NY 10001',
    '456 Oak Ave, New York, NY 10002',
    '789 Pine Rd, New York, NY 10003',
    '321 Elm St, New York, NY 10004',
  ]

  const handleAddressChange = (value: string) => {
    setAddress(value)
    setValidationResult(null)

    // Show suggestions if user is typing
    if (value.length > 2) {
      const filtered = mockSuggestions.filter((suggestion) =>
        suggestion.toLowerCase().includes(value.toLowerCase()),
      )
      setSuggestions(filtered)
    } else {
      setSuggestions([])
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setAddress(suggestion)
    setSuggestions([])
    validateAddress(suggestion)
  }

  const validateAddress = async (addressToValidate: string) => {
    setIsValidating(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Check if address contains "bad" (case insensitive)
    const isValid = !addressToValidate.toLowerCase().includes('bad')

    setValidationResult({
      valid: isValid,
      message: isValid ? 'Great! We serve your area.' : "Sorry, we don't serve this location.",
    })

    setIsValidating(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (address.trim()) {
      validateAddress(address)
    }
  }

  const handleContinue = () => {
    if (validationResult?.valid && service) {
      const params = new URLSearchParams({
        service: service.id,
        address: address
      })
      router.push(`/scheduler/datetime?${params.toString()}`)
    }
  }

  // Show bad example after a delay if user hasn't interacted
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!validationResult && !showBadExample) {
        setShowBadExample(true)
        setAddress('Bad Address, Out of Service Area, NY 99999')
        validateAddress('Bad Address, Out of Service Area, NY 99999')
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [validationResult, showBadExample])

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Enter Your Address</h1>
          {service && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800">
                <span className="font-semibold">Selected Service:</span> {service.name} - $
                {service.price}
              </p>
            </div>
          )}
          <p className="text-lg text-gray-600">We'll check if we serve your area</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <input
                type="text"
                id="address"
                value={address}
                onChange={(e) => handleAddressChange(e.target.value)}
                placeholder="Start typing your address..."
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isValidating}
              />

              {/* Address suggestions */}
              {suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={!address.trim() || isValidating}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isValidating ? 'Checking...' : 'Check Service Area'}
            </button>
          </form>

          {/* Validation result */}
          {validationResult && (
            <div
              className={`mt-6 p-4 rounded-md border ${
                validationResult.valid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {validationResult.valid ? (
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
                  ) : (
                    <svg
                      className="w-5 h-5 text-red-400 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  <p
                    className={`font-medium ${
                      validationResult.valid ? 'text-green-800' : 'text-red-800'
                    }`}
                  >
                    {validationResult.message}
                  </p>
                </div>
                {validationResult.valid && (
                  <button
                    onClick={handleContinue}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors duration-200"
                  >
                    Continue
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Demo note */}
          <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              <strong>Demo Note:</strong> Type "bad" anywhere in the address to see the
              out-of-service-area message.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
