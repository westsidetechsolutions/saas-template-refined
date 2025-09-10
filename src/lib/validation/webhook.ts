import { z } from 'zod'

// Webhook event schemas
export const checkoutSessionCompletedSchema = z.object({
  id: z.string(),
  customer_email: z.string().email().optional(),
  customer: z.string().optional(),
  subscription: z.string().optional(),
  mode: z.string(),
  metadata: z.record(z.string()).optional(),
})

export const subscriptionSchema = z.object({
  id: z.string(),
  customer: z.string(),
  status: z.enum([
    'active',
    'canceled',
    'incomplete',
    'incomplete_expired',
    'past_due',
    'trialing',
    'unpaid',
    'paused',
  ]),
  current_period_end: z.number(),
  cancel_at_period_end: z.boolean().optional(),
  items: z.object({
    data: z.array(
      z.object({
        price: z.object({
          id: z.string(),
        }),
        current_period_end: z.number().optional(),
      }),
    ),
  }),
})

export const invoiceSchema = z.object({
  id: z.string(),
  subscription: z.string().optional(),
  status: z.string(),
  amount_paid: z.number(),
  amount_due: z.number(),
})

// Webhook event type schema
export const webhookEventSchema = z.object({
  id: z.string(),
  type: z.string(),
  data: z.object({
    object: z.any(), // This will be validated by specific schemas
  }),
})

// Validation functions
export function validateCheckoutSessionCompleted(data: any) {
  return checkoutSessionCompletedSchema.parse(data)
}

export function validateSubscription(data: any) {
  return subscriptionSchema.parse(data)
}

export function validateInvoice(data: any) {
  return invoiceSchema.parse(data)
}

export function validateWebhookEvent(data: any) {
  return webhookEventSchema.parse(data)
}
