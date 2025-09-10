'use client'

import { useState, useEffect } from 'react'
import { getAllJobs, existingJob, getJobs } from '../data/jobs'

interface TimeSlot {
  time: string
  type: 'job' | 'travel' | 'available'
  job?: any
  travelFrom?: string
  travelTo?: string
  travelDuration?: number
  isStart?: boolean
}

export default function DashboardPage() {
  const [jobs, setJobs] = useState<any[]>([])
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])

  useEffect(() => {
    // Get all jobs (dummy + saved) regardless of date
    const allJobs = getAllJobs()

    // Remove duplicates based on id
    const uniqueJobs = allJobs.filter(
      (job, index, self) => index === self.findIndex((j) => j.id === job.id),
    )
    // Sort jobs by start time to ensure proper travel time calculation
    const sortedJobs = uniqueJobs.sort(
      (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime),
    )
    setJobs(sortedJobs)

    // Generate time slots for the day
    generateTimeSlots(sortedJobs)
  }, [])

  const generateTimeSlots = (dayJobs: any[]) => {
    const slots: TimeSlot[] = []
    const startHour = 8 // 8 AM
    const endHour = 20 // 8 PM (extended to show 4:00 PM job)

    for (let hour = startHour; hour < endHour; hour++) {
      const time = `${hour.toString().padStart(2, '0')}:00`
      const time30 = `${hour.toString().padStart(2, '0')}:30`

      console.log(`Processing time slots: ${time} and ${time30}`)

      // Check if this time has a job (including jobs that span this time)
      const jobAtTime = dayJobs.find((job) => {
        const jobStart = timeToMinutes(job.startTime)
        const jobEnd = timeToMinutes(job.endTime)
        const currentTime = timeToMinutes(time)
        return currentTime >= jobStart && currentTime < jobEnd
      })

      const jobAtTime30 = dayJobs.find((job) => {
        const jobStart = timeToMinutes(job.startTime)
        const jobEnd = timeToMinutes(job.endTime)
        const currentTime = timeToMinutes(time30)
        return currentTime >= jobStart && currentTime < jobEnd
      })

      // Check if this is travel time between jobs
      const isTravelTime = checkIfTravelTime(time, dayJobs)
      const isTravelTime30 = checkIfTravelTime(time30, dayJobs)

      // Debug travel time detection
      if (isTravelTime) {
        console.log(`Travel time detected at ${time}:`, isTravelTime)
      }
      if (isTravelTime30) {
        console.log(`Travel time detected at ${time30}:`, isTravelTime30)
      }

      // Determine slot type with priority: job > travel > available
      const getSlotType = (hasJob: any, hasTravel: any) => {
        if (hasJob) return 'job'
        if (hasTravel) return 'travel'
        return 'available'
      }

      const slotType = getSlotType(jobAtTime, isTravelTime)
      const slotType30 = getSlotType(jobAtTime30, isTravelTime30)

      // Check if this is the start of a job or travel block
      const isJobStart = jobAtTime && time === jobAtTime.startTime
      const isJobStart30 = jobAtTime30 && time30 === jobAtTime30.startTime

      // For travel blocks, only mark the first time slot as start (same logic as jobs)
      const isTravelStart = isTravelTime && time === getTravelStartTime(isTravelTime, dayJobs)
      const isTravelStart30 =
        isTravelTime30 && time30 === getTravelStartTime(isTravelTime30, dayJobs)

      // Debug logging
      if (isTravelTime) {
        console.log(
          `Travel slot at ${time}: isStart = ${isTravelStart}, duration = ${isTravelTime.duration}`,
        )
      }
      if (isTravelTime30) {
        console.log(
          `Travel slot at ${time30}: isStart = ${isTravelStart30}, duration = ${isTravelTime30.duration}`,
        )
      }

      slots.push({
        time,
        type: slotType,
        job: jobAtTime,
        travelFrom: isTravelTime?.from,
        travelTo: isTravelTime?.to,
        travelDuration: isTravelTime?.duration,
        isStart: isJobStart || isTravelStart,
      })

      slots.push({
        time: time30,
        type: slotType30,
        job: jobAtTime30,
        travelFrom: isTravelTime30?.from,
        travelTo: isTravelTime30?.to,
        travelDuration: isTravelTime30?.duration,
        isStart: isJobStart30 || isTravelStart30,
      })
    }

    setTimeSlots(slots)
  }

  const getTravelStartTime = (travelInfo: any, dayJobs: any[]) => {
    // Find the job that this travel time belongs to
    for (let i = 0; i < dayJobs.length - 1; i++) {
      const currentJob = dayJobs[i]
      const nextJob = dayJobs[i + 1]

      if (
        travelInfo.from === currentJob.customerAddress &&
        travelInfo.to === nextJob.customerAddress
      ) {
        const travelTimeNeeded = nextJob.travelTime || 0
        const travelStartTime = subtractMinutes(nextJob.startTime, travelTimeNeeded)

        // Round to the nearest 30-minute slot
        const travelStartInMinutes = timeToMinutes(travelStartTime)
        const roundedMinutes = Math.floor(travelStartInMinutes / 30) * 30
        const hours = Math.floor(roundedMinutes / 60)
        const minutes = roundedMinutes % 60
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
      }
    }

    // For travel to first job
    if (travelInfo.from === 'Office/Shop' && dayJobs.length > 0) {
      const firstJob = dayJobs[0]
      const travelTimeToFirstJob = firstJob.travelTime || 0
      const travelStartTime = subtractMinutes(firstJob.startTime, travelTimeToFirstJob)

      // Round to the nearest 30-minute slot
      const travelStartInMinutes = timeToMinutes(travelStartTime)
      const roundedMinutes = Math.floor(travelStartInMinutes / 30) * 30
      const hours = Math.floor(roundedMinutes / 60)
      const minutes = roundedMinutes % 60
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
    }

    return null
  }

  const checkIfTravelTime = (time: string, dayJobs: any[]) => {
    // Check if this time falls within travel time to the first job of the day
    if (dayJobs.length > 0) {
      const firstJob = dayJobs[0]
      const firstJobStart = firstJob.startTime
      const travelTimeToFirstJob = firstJob.travelTime || 0
      const travelStartTime = subtractMinutes(firstJobStart, travelTimeToFirstJob)

      // Check if current time slot is the closest one to when travel should start
      const timeInMinutes = timeToMinutes(time)
      const travelStartInMinutes = timeToMinutes(travelStartTime)
      const firstJobStartInMinutes = timeToMinutes(firstJobStart)

      // Show travel time if this slot is within the travel window or is the closest slot before travel starts
      if (timeInMinutes >= travelStartInMinutes && timeInMinutes < firstJobStartInMinutes) {
        return {
          from: 'Office/Shop',
          to: firstJob.customerAddress,
          duration: travelTimeToFirstJob,
        }
      }

      // If travel should start at 10:37 but we're at 10:30, show travel (closest slot)
      if (timeInMinutes < travelStartInMinutes && timeInMinutes + 30 >= travelStartInMinutes) {
        return {
          from: 'Office/Shop',
          to: firstJob.customerAddress,
          duration: travelTimeToFirstJob,
        }
      }
    }

    // Check if this time falls within travel time between jobs
    for (let i = 0; i < dayJobs.length - 1; i++) {
      const currentJob = dayJobs[i]
      const nextJob = dayJobs[i + 1]

      const currentJobEnd = currentJob.endTime
      const nextJobStart = nextJob.startTime

      // Calculate travel time needed (use the travel time from the next job)
      const travelTimeNeeded = nextJob.travelTime || 0

      // Calculate when travel should start
      const travelStartTime = subtractMinutes(nextJobStart, travelTimeNeeded)

      // Check if current time is within the travel window
      const timeInMinutes = timeToMinutes(time)
      const travelStartInMinutes = timeToMinutes(travelStartTime)
      const nextJobStartInMinutes = timeToMinutes(nextJobStart)

      console.log(
        `Travel calculation for ${time}: travelStart=${travelStartTime}, travelStartInMinutes=${travelStartInMinutes}, timeInMinutes=${timeInMinutes}, nextJobStartInMinutes=${nextJobStartInMinutes}`,
      )

      // Return travel time for any slot that falls within the travel window
      // Also include the slot that contains the travel start time (for rounding purposes)
      if (timeInMinutes >= travelStartInMinutes && timeInMinutes < nextJobStartInMinutes) {
        console.log(
          `Travel time between jobs detected at ${time}: ${currentJob.customerAddress} → ${nextJob.customerAddress} (${travelTimeNeeded} min)`,
        )
        return {
          from: currentJob.customerAddress,
          to: nextJob.customerAddress,
          duration: travelTimeNeeded,
        }
      }

      // Also check if this slot contains the travel start time (for rounding to 30-minute slots)
      if (timeInMinutes < travelStartInMinutes && timeInMinutes + 30 >= travelStartInMinutes) {
        console.log(
          `Travel time between jobs detected at ${time} (contains start): ${currentJob.customerAddress} → ${nextJob.customerAddress} (${travelTimeNeeded} min)`,
        )
        return {
          from: currentJob.customerAddress,
          to: nextJob.customerAddress,
          duration: travelTimeNeeded,
        }
      }
    }
    return null
  }

  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  }

  const subtractMinutes = (time: string, minutes: number): string => {
    const [hours, mins] = time.split(':').map(Number)
    const totalMinutes = hours * 60 + mins - minutes
    const newHours = Math.floor(totalMinutes / 60)
    const newMins = totalMinutes % 60
    return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`
  }

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const getTimeSlotHeight = (slot: TimeSlot) => {
    if (slot.type === 'job' && slot.job) {
      // Calculate height based on job duration (30 minutes = 1 unit)
      const durationInMinutes = slot.job.duration * 60
      const heightUnits = Math.ceil(durationInMinutes / 30)
      return `${heightUnits * 60}px` // 60px per 30-minute unit
    }
    if (slot.type === 'travel') {
      // Travel time blocks should be smaller to show they're buffers
      return '40px'
    }
    return '60px' // Default height for 30-minute slots
  }

  const getTimeSlotColor = (slot: TimeSlot) => {
    switch (slot.type) {
      case 'job':
        return 'bg-blue-500 text-white'
      case 'travel':
        return 'bg-orange-400 text-white'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Dashboard Calendar View</h1>
          <p className="text-lg text-gray-600">
            Travel time is automatically built into my schedule
          </p>
        </div>

        {/* Calendar View */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Today's Schedule</h2>
            <div className="text-sm text-gray-500">
              {jobs.length > 0
                ? new Date(jobs[0].date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
            </div>
          </div>

          {/* Time Slots */}
          <div className="space-y-0">
            {timeSlots.map((slot, index) => {
              // Skip rendering if this is not the start of a block
              if (slot.type !== 'available' && !slot.isStart) {
                return null
              }

              // Calculate how many slots this block should span
              let blockSpan = 1
              if (slot.type === 'job' && slot.job) {
                const duration = slot.job.duration * 60 // in minutes
                blockSpan = Math.ceil(duration / 30)
              } else if (slot.type === 'travel') {
                // Use the travel duration stored in the slot data
                const travelDuration = slot.travelDuration || 0
                blockSpan = Math.ceil(travelDuration / 30)
              }

              return (
                <div key={index} className="flex items-center">
                  {/* Time Label */}
                  <div className="w-20 text-sm text-gray-500 font-medium">
                    {formatTime(slot.time)}
                  </div>

                  {/* Time Slot */}
                  <div
                    className={`flex-1 rounded-lg p-3 mx-2 ${getTimeSlotColor(slot)}`}
                    style={{
                      height: `${blockSpan * 60}px`,
                      marginBottom: slot.type === 'available' ? '8px' : '0px',
                    }}
                  >
                    {slot.type === 'job' && slot.job && (
                      <div className="h-full flex flex-col justify-center">
                        <div className="font-medium">{slot.job.serviceName}</div>
                        <div className="text-sm opacity-90">
                          {slot.job.customerAddress.split(',')[0]}
                        </div>
                        <div className="text-xs opacity-75">
                          {formatTime(slot.job.startTime)} - {formatTime(slot.job.endTime)}
                        </div>
                      </div>
                    )}

                    {slot.type === 'travel' && (
                      <div className="h-full flex flex-col justify-center">
                        <div className="font-medium">Travel Time</div>
                        <div className="text-sm opacity-90">
                          {slot.travelFrom === 'Office/Shop'
                            ? `Office → ${slot.travelTo?.split(',')[0]}`
                            : `${slot.travelFrom?.split(',')[0]} → ${slot.travelTo?.split(',')[0]}`}
                        </div>
                        <div className="text-xs opacity-75">
                          {slot.travelDuration ? `${slot.travelDuration} min drive` : ''}
                        </div>
                      </div>
                    )}

                    {slot.type === 'available' && (
                      <div className="h-full flex items-center justify-center text-sm">
                        Available
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule Legend</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-500 rounded mr-3"></div>
              <span className="text-sm text-gray-700">Booked Jobs</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-orange-400 rounded mr-3"></div>
              <span className="text-sm text-gray-700">Travel Buffer</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-100 rounded mr-3"></div>
              <span className="text-sm text-gray-700">Available Time</span>
            </div>
          </div>
        </div>

        {/* Job Details */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Jobs</h3>
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">{job.serviceName}</h4>
                    <p className="text-sm text-gray-600 mt-1">{job.customerAddress}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatTime(job.startTime)} - {formatTime(job.endTime)} ({job.duration} hours)
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Travel Time</div>
                    <div className="font-medium">{job.travelTime} minutes</div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span>Total Cost: ${job.totalCost}</span>
                    <span>Deposit: ${job.depositAmount}</span>
                    <span className="text-green-600">Status: {job.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Debug section */}
        <div className="mt-6 bg-gray-100 p-4 rounded">
          <h3 className="font-semibold mb-2">Debug Info:</h3>
          <div className="text-sm">
            <div>Jobs loaded: {jobs.length}</div>
            {jobs.map((job, i) => (
              <div key={job.id}>
                Job {i + 1}: {job.serviceName} at {job.startTime}-{job.endTime}
                (Travel: {job.travelTime}min) - {job.customerAddress}
              </div>
            ))}
            <div>Travel slots: {timeSlots.filter((s) => s.type === 'travel').length}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
