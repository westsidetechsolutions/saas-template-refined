import { CollectionConfig } from 'payload/types'

const ApiKeys: CollectionConfig = {
  slug: 'api_keys',
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'user', type: 'relationship', relationTo: 'users', required: true, index: true },
    { name: 'name', type: 'text', required: true },
    { name: 'keyHash', type: 'text', required: true }, // store hash only
    { name: 'scopes', type: 'json' },
    { name: 'revokedAt', type: 'date' },
  ],
  access: {
    read: ({ req }) => !!req.user, // tighten later
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  timestamps: true,
}

export default ApiKeys
