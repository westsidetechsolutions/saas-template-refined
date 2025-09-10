import type { CollectionConfig } from 'payload'

export const GlobalSettings: CollectionConfig = {
  slug: 'global-settings',
  admin: {
    useAsTitle: 'name',
    group: 'Settings',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      defaultValue: 'Default Settings',
    },
    {
      name: 'pricingRedirectUrl',
      type: 'text',
      label: 'Pricing Redirect URL',
      admin: {
        description:
          'URL to redirect non-subscribed users after login. Defaults to homepage pricing section.',
        placeholder: 'https://yoursite.com/#pricing',
      },
      defaultValue: '/#pricing',
    },
    {
      name: 'isActive',
      type: 'checkbox',
      label: 'Active Settings',
      admin: {
        description: 'Only one settings record should be active at a time.',
      },
      defaultValue: true,
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        // If this record is being set as active, deactivate all others
        if (data.isActive) {
          await req.payload.update({
            collection: 'global-settings',
            where: {
              isActive: {
                equals: true,
              },
            },
            data: {
              isActive: false,
            },
          })
        }
        return data
      },
    ],
  },
}
