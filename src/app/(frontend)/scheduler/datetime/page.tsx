'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { getServiceById } from '../data/services'

interface TimeSlot {
  time: string
  available: boolean
  blockedReason?: string
  travelTime?: number
}

export default function DateTimePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const serviceId = searchParams.get('service')
  const address = searchParams.get('address')

  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const service = serviceId ? getServiceById(serviceId) : null

  // Generate available dates (next 7 days)
  useEffect(() => {
    const dates = []
    const today = new Date()
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      dates.push(date.toISOString().split('T')[0])
    }
    setAvailableDates(dates)
  }, [])

  // Generate time slots for selected date
  const generateTimeSlots = (date: string): TimeSlot[] => {
    const slots: TimeSlot[] = []
    const startHour = 8 // 8 AM
    const endHour = 18 // 6 PM

    for (let hour = startHour; hour < endHour; hour++) {
      const time = `${hour.toString().padStart(2, '0')}:00`
      const time30 = `${hour.toString().padStart(2, '0')}:30`

      // Check if this time slot should be blocked
      // Block 1:00 PM - 3:00 PM (dummy job), allow 3:30 PM and later
      const isBlocked = (hour >= 13 && hour < 15) || (hour === 15 && time === '15:00')

      slots.push({
        time,
        available: !isBlocked,
        blockedReason: isBlocked ? 'Unavailable' : undefined,
        travelTime: undefined,
      })

      slots.push({
        time: time30,
        available: !isBlocked,
        blockedReason: isBlocked ? 'Unavailable' : undefined,
        travelTime: undefined,
      })
    }

    return slots
  }

  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
    setSelectedTime('')
    setIsLoading(true)

    // Simulate loading time slots
    setTimeout(() => {
      setTimeSlots(generateTimeSlots(date))
      setIsLoading(false)
    }, 500)
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
  }

  const handleContinue = () => {
    if (selectedDate && selectedTime) {
      // Navigate to confirmation page
      const params = new URLSearchParams({
        service: serviceId || '',
        address: address || '',
        date: selectedDate,
        time: selectedTime,
      })
      router.push(`/scheduler/confirmation?${params.toString()}`)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Pick Date & Time</h1>
          {service && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800">
                <span className="font-semibold">Selected Service:</span> {service.name} - $
                {service.price}
              </p>
              {address && (
                <p className="text-blue-800 mt-1">
                  <span className="font-semibold">Address:</span> {address}
                </p>
              )}
            </div>
          )}
          <p className="text-lg text-gray-600">
            Only time slots that work with travel schedule are shown
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Date Selection */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Date</h2>
            <div className="grid gap-2">
              {availableDates.map((date) => (
                <button
                  key={date}
                  onClick={() => handleDateSelect(date)}
                  className={`p-3 text-left rounded-md border transition-colors ${
                    selectedDate === date
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {formatDate(date)}
                </button>
              ))}
            </div>
          </div>

          {/* Time Selection */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Time</h2>

            {!selectedDate ? (
              <p className="text-gray-500 text-center py-8">Please select a date first</p>
            ) : isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading available times...</p>
              </div>
            ) : (
              <div className="grid gap-2">
                {timeSlots.map((slot) => (
                  <div key={slot.time} className="relative">
                    <button
                      onClick={() => slot.available && handleTimeSelect(slot.time)}
                      disabled={!slot.available}
                      className={`w-full p-3 text-left rounded-md border transition-colors ${
                        selectedTime === slot.time
                          ? 'border-blue-500 bg-blue-50 text-blue-900'
                          : slot.available
                            ? 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <span>{slot.time}</span>
                    </button>

                    {/* Tooltip for blocked slots */}
                    {!slot.available && slot.blockedReason && (
                      <div className="absolute z-10 w-64 p-2 bg-red-100 border border-red-300 rounded-md shadow-lg -top-2 left-full ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-xs text-red-800">⚠️ {slot.blockedReason}</p>
                        <div className="absolute top-2 -left-1 w-2 h-2 bg-red-100 border-l border-t border-red-300 transform rotate-45"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Continue Button */}
        {selectedDate && selectedTime && (
          <div className="mt-8 text-center">
            <button
              onClick={handleContinue}
              className="bg-blue-600 text-white py-3 px-8 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
            >
              Continue to Confirmation
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
