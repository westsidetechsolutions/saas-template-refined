import { CollectionConfig } from 'payload/types'

const Usage: CollectionConfig = {
  slug: 'usage',
  admin: { useAsTitle: 'id' },
  fields: [
    { name: 'user', type: 'relationship', relationTo: 'users', required: true, index: true },
    { name: 'periodStart', type: 'date', required: true, index: true },
    { name: 'periodEnd', type: 'date', required: true, index: true },
    // counters
    { name: 'apiCalls', type: 'number', required: true, defaultValue: 0, min: 0 },
    { name: 'itemsCreated', type: 'number', required: true, defaultValue: 0, min: 0 },
    { name: 'storageMb', type: 'number', required: true, defaultValue: 0, min: 0 },
    { name: 'lastUpdatedAt', type: 'date' },
  ],
  indexes: [{ fields: ['user', 'periodStart', 'periodEnd'], unique: true }],
  access: {
    read: ({ req }) => !!req.user,
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  timestamps: true,
}

export default Usage
