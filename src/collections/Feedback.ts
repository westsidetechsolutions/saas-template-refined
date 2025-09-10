import type { CollectionConfig } from 'payload'

export const Feedback: CollectionConfig = {
  slug: 'feedback',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'status', 'user', 'createdAt'],
  },
  access: {
    create: ({ req: { user } }) => {
      // Users can create feedback
      return true
    },
    read: ({ req: { user } }) => {
      // Users can only read their own feedback, admins can read all
      if (user?.role === 'admin') {
        return true
      }
      return {
        user: {
          equals: user?.id,
        },
      }
    },
    update: ({ req: { user } }) => {
      // Users can update their own feedback, admins can update all
      if (user?.role === 'admin') {
        return true
      }
      return {
        user: {
          equals: user?.id,
        },
      }
    },
    delete: ({ req: { user } }) => {
      // Only admins can delete feedback
      return user?.role === 'admin'
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'A brief title for the feedback or feature request',
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Bug Report', value: 'bug' },
        { label: 'Feature Request', value: 'feature' },
        { label: 'General Feedback', value: 'feedback' },
        { label: 'Improvement Suggestion', value: 'improvement' },
      ],
      defaultValue: 'feedback',
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Detailed description of the feedback or feature request',
      },
    },
    {
      name: 'priority',
      type: 'select',
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Medium', value: 'medium' },
        { label: 'High', value: 'high' },
        { label: 'Critical', value: 'critical' },
      ],
      defaultValue: 'medium',
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Submitted', value: 'submitted' },
        { label: 'Under Review', value: 'reviewing' },
        { label: 'In Progress', value: 'in-progress' },
        { label: 'Completed', value: 'completed' },
        { label: 'Declined', value: 'declined' },
      ],
      defaultValue: 'submitted',
      admin: {
        readOnly: true, // Simplified to boolean instead of function
      },
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'adminNotes',
      type: 'textarea',
      admin: {
        description: 'Internal notes for admin use only',
        position: 'sidebar',
        readOnly: true, // Simplified to boolean instead of function
      },
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        {
          name: 'tag',
          type: 'text',
        },
      ],
      admin: {
        description: 'Tags to categorize the feedback',
      },
    },
    {
      name: 'attachments',
      type: 'array',
      fields: [
        {
          name: 'file',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'description',
          type: 'text',
        },
      ],
      admin: {
        description: 'Any relevant files or screenshots',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ req, data }) => {
        // Automatically set the user when creating feedback
        if (!data.user && req.user) {
          data.user = req.user.id
        }
        return data
      },
    ],
  },
}
