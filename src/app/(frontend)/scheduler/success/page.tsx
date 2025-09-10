'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { getServiceById } from '../data/services'
import { saveJob } from '../data/jobs'

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const serviceId = searchParams.get('service')
  const address = searchParams.get('address')
  const date = searchParams.get('date')
  const time = searchParams.get('time')

  const [showSMS, setShowSMS] = useState(false)
  const [smsAnimation, setSmsAnimation] = useState(false)

  const service = serviceId ? getServiceById(serviceId) : null

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
    })
  }

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  useEffect(() => {
    // Save the booking to local storage
    if (service && address && date && time) {
      const newJob = {
        id: `job-${Date.now()}`,
        serviceName: service.name,
        customerAddress: address,
        date: date,
        startTime: time,
        endTime: calculateEndTime(time, service.duration),
        duration: service.duration,
        travelTime: 46, // 46 minute travel time as specified
        totalTime: service.duration * 60 + 46, // duration in minutes + travel time
        status: 'scheduled' as const,
        depositPaid: true,
        totalCost: service.price,
        depositAmount: 50,
      }
      saveJob(newJob)
    }

    // Show SMS after a short delay
    const timer = setTimeout(() => {
      setShowSMS(true)
      setSmsAnimation(true)
    }, 1000)

    return () => clearTimeout(timer)
  }, [service, address, date, time])

  const calculateEndTime = (startTime: string, duration: number): string => {
    const [hours, minutes] = startTime.split(':').map(Number)
    const totalMinutes = hours * 60 + minutes + duration * 60
    const endHours = Math.floor(totalMinutes / 60)
    const endMinutes = totalMinutes % 60
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`
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
      <div className="max-w-6xl mx-auto">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Booking Confirmation */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
              <p className="text-lg text-gray-600">
                Your appointment has been scheduled successfully
              </p>
            </div>

            <div className="space-y-4 mb-8">
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
                <span className="font-medium">{formatTime(time)}</span>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium">{service.duration} hours</span>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="text-gray-600">Deposit Paid:</span>
                <span className="font-medium text-green-600">$50</span>
              </div>

              <div className="flex justify-between items-center py-3">
                <span className="text-gray-600">Remaining Balance:</span>
                <span className="font-medium">${service.price - 50}</span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
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
                  <p className="text-blue-800 font-medium">What's next?</p>
                  <p className="text-blue-700 text-sm mt-1">
                    You'll receive a text confirmation shortly. Our technician will arrive at the
                    scheduled time. Please have the remaining balance ready for payment upon
                    completion.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SMS Notification */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">SMS Confirmation</h2>

            <div className="flex justify-center">
              <div className="relative">
                {/* Phone Frame */}
                <div className="w-80 h-96 bg-gray-900 rounded-3xl p-2 shadow-2xl">
                  <div className="w-full h-full bg-white rounded-2xl overflow-hidden">
                    {/* Phone Header */}
                    <div className="bg-gray-100 px-4 py-2 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">HVAC</span>
                        </div>
                        <span className="ml-2 text-sm font-medium">HVAC Pro</span>
                      </div>
                      <span className="text-xs text-gray-500">Now</span>
                    </div>

                    {/* Messages */}
                    <div className="p-4 space-y-3">
                      {showSMS && (
                        <div
                          className={`transition-all duration-500 ${smsAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                        >
                          <div className="bg-blue-500 text-white rounded-lg rounded-br-none px-4 py-3 max-w-xs">
                            <p className="text-sm">
                              Your appointment is confirmed for {formatDate(date)} at{' '}
                              {formatTime(time)}. We'll send a reminder 1 hour before arrival.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Notification Badge */}
                {showSMS && (
                  <div
                    className={`absolute -top-2 -right-2 transition-all duration-500 ${smsAnimation ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}
                  >
                    <div className="bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
                      1
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">SMS automatically sent to your phone number</p>
            </div>
          </div>
        </div>

        {/* Demo Information */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Automatic SMS Confirmations</h3>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>
              • <strong>Instant confirmation</strong> — SMS sent immediately after booking
            </li>
            <li>
              • <strong>Professional branding</strong> — shows "HVAC Pro" as sender
            </li>
            <li>
              • <strong>Reminder system</strong> — automatic 1-hour reminder before appointment
            </li>
            <li>
              • <strong>No manual work</strong> — completely automated communication
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
