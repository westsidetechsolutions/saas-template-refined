import { describe, it, expect } from 'vitest'
import {
  validateCheckoutSessionCompleted,
  validateSubscription,
  validateInvoice,
  validateWebhookEvent,
} from '../webhook'

describe('Webhook Validation', () => {
  describe('Checkout Session Completed', () => {
    it('should validate valid checkout session data', () => {
      const validData = {
        id: 'cs_test_123',
        customer_email: 'test@example.com',
        customer: 'cus_test_123',
        subscription: 'sub_test_123',
        mode: 'subscription',
        metadata: {
          userId: 'user_123',
          orgId: 'org_123',
        },
      }

      expect(() => validateCheckoutSessionCompleted(validData)).not.toThrow()
    })

    it('should reject invalid email', () => {
      const invalidData = {
        id: 'cs_test_123',
        customer_email: 'invalid-email',
        mode: 'subscription',
      }

      expect(() => validateCheckoutSessionCompleted(invalidData)).toThrow()
    })
  })

  describe('Subscription', () => {
    it('should validate valid subscription data', () => {
      const validData = {
        id: 'sub_test_123',
        customer: 'cus_test_123',
        status: 'active',
        current_period_end: 1640995200,
        cancel_at_period_end: false,
        items: {
          data: [
            {
              price: {
                id: 'price_test_123',
              },
              current_period_end: 1640995200,
            },
          ],
        },
      }

      expect(() => validateSubscription(validData)).not.toThrow()
    })

    it('should reject invalid status', () => {
      const invalidData = {
        id: 'sub_test_123',
        customer: 'cus_test_123',
        status: 'invalid_status',
        current_period_end: 1640995200,
        items: {
          data: [
            {
              price: {
                id: 'price_test_123',
              },
            },
          ],
        },
      }

      expect(() => validateSubscription(invalidData)).toThrow()
    })
  })

  describe('Invoice', () => {
    it('should validate valid invoice data', () => {
      const validData = {
        id: 'in_test_123',
        subscription: 'sub_test_123',
        status: 'paid',
        amount_paid: 2000,
        amount_due: 0,
      }

      expect(() => validateInvoice(validData)).not.toThrow()
    })

    it('should validate invoice without subscription', () => {
      const validData = {
        id: 'in_test_123',
        status: 'paid',
        amount_paid: 2000,
        amount_due: 0,
      }

      expect(() => validateInvoice(validData)).not.toThrow()
    })
  })

  describe('Webhook Event', () => {
    it('should validate valid webhook event', () => {
      const validData = {
        id: 'evt_test_123',
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123',
            mode: 'subscription',
          },
        },
      }

      expect(() => validateWebhookEvent(validData)).not.toThrow()
    })

    it('should reject missing required fields', () => {
      const invalidData = {
        id: 'evt_test_123',
        // missing type and data
      }

      expect(() => validateWebhookEvent(invalidData)).toThrow()
    })
  })
})
