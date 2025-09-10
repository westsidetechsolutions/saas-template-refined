import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers()
    const payload = await getPayload({ config })
    const { user } = await payload.auth({ headers: headersList })

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, type, description, priority, tags } = body

    // Validate required fields
    if (!title || !type || !description) {
      return NextResponse.json(
        { error: 'Title, type, and description are required' },
        { status: 400 },
      )
    }

    // Create the feedback
    const feedback = await payload.create({
      collection: 'feedback',
      data: {
        title,
        type,
        description,
        priority: priority || 'medium',
        tags: tags || [],
        user: user.id,
      },
    })

    return NextResponse.json({ success: true, feedback })
  } catch (error) {
    console.error('Feedback submission error:', error)
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const headersList = await headers()
    const payload = await getPayload({ config })
    const { user } = await payload.auth({ headers: headersList })

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's feedback
    const feedback = await payload.find({
      collection: 'feedback',
      where: {
        user: {
          equals: user.id,
        },
      },
      sort: '-createdAt',
    })

    return NextResponse.json({ feedback: feedback.docs })
  } catch (error) {
    console.error('Feedback fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 })
  }
}
