export interface Job {
  id: string
  serviceName: string
  customerAddress: string
  date: string
  startTime: string
  endTime: string
  duration: number // in hours
  travelTime: number // in minutes
  totalTime: number // in minutes (duration + travel time)
  status: 'scheduled' | 'completed' | 'cancelled'
  depositPaid: boolean
  totalCost: number
  depositAmount: number
}

// Dummy job that's already on the schedule
export const existingJob: Job = {
  id: 'job-1',
  serviceName: 'AC Repair',
  customerAddress: '123 Oak Street, New York, NY 10001',
  date: new Date().toISOString().split('T')[0], // Use today's date
  startTime: '13:00',
  endTime: '15:00',
  duration: 2,
  travelTime: 23,
  totalTime: 143, // 2 hours + 23 minutes = 143 minutes
  status: 'scheduled',
  depositPaid: true,
  totalCost: 200,
  depositAmount: 50,
}

// Local storage utilities
const STORAGE_KEY = 'scheduler_jobs'

export const saveJob = (job: Job): void => {
  try {
    const existingJobs = getJobs()
    const updatedJobs = [...existingJobs, job]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedJobs))
  } catch (error) {
    console.error('Error saving job to localStorage:', error)
  }
}

export const getJobs = (): Job[] => {
  try {
    const jobs = localStorage.getItem(STORAGE_KEY)
    return jobs ? JSON.parse(jobs) : []
  } catch (error) {
    console.error('Error reading jobs from localStorage:', error)
    return []
  }
}

export const getAllJobs = (): Job[] => {
  const savedJobs = getJobs()
  const allJobs = [existingJob, ...savedJobs]

  console.log('getAllJobs debug:', {
    savedJobsCount: savedJobs.length,
    allJobsCount: allJobs.length,
  })

  return allJobs
}

export const getAllJobsForDate = (date: string): Job[] => {
  const savedJobs = getJobs()

  // Create a dynamic dummy job with the target date
  const dynamicDummyJob: Job = {
    ...existingJob,
    date: date, // Use the target date instead of the static date
  }

  const allJobs = [dynamicDummyJob, ...savedJobs]

  console.log('getAllJobsForDate debug:', {
    targetDate: date,
    dummyJobDate: dynamicDummyJob.date,
    savedJobsCount: savedJobs.length,
    savedJobDates: savedJobs.map((job) => job.date),
    allJobsCount: allJobs.length,
    allJobDates: allJobs.map((job) => job.date),
  })

  const filteredJobs = allJobs.filter((job) => job.date === date)
  console.log('Filtered jobs count:', filteredJobs.length)

  return filteredJobs
}

export const clearJobs = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Error clearing jobs from localStorage:', error)
  }
}

// Helper function to clear old jobs and start fresh
export const clearOldJobs = (): void => {
  try {
    const today = new Date().toISOString().split('T')[0]
    const savedJobs = getJobs()
    const todayJobs = savedJobs.filter((job) => job.date === today)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todayJobs))
    console.log('Cleared old jobs, kept', todayJobs.length, 'jobs for today')
  } catch (error) {
    console.error('Error clearing old jobs:', error)
  }
}
