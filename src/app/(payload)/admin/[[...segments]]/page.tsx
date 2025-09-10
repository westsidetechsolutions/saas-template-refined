/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { RootPage, generatePageMetadata } from '@payloadcms/next/views'
import { importMap } from '../importMap'

type Args = {
  params: Promise<{
    segments: string[]
  }>
  searchParams: Promise<{
    [key: string]: string | string[]
  }>
}

export const generateMetadata = ({ params, searchParams }: Args): Promise<Metadata> =>
  generatePageMetadata({ config, params, searchParams })

const Page = async ({ params, searchParams }: Args) => {
  // Check authentication and role
  const headersList = await headers()
  const payload = await getPayload({ config })

  try {
    const { user } = await payload.auth({ headers: headersList })

    if (!user) {
      // Not authenticated - redirect to login
      redirect('/login?next=/admin')
    }

    if (user.role !== 'admin') {
      // Not admin - redirect to dashboard
      redirect('/dashboard')
    }

    // User is admin - show Payload admin
    return RootPage({ config, params, searchParams, importMap })
  } catch (error) {
    // Authentication error - redirect to login
    redirect('/login?next=/admin')
  }
}

export default Page
