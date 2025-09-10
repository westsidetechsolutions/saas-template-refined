import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { Resend } from 'resend'
import { render } from '@react-email/render'
import InvoiceReceipt from '../../../../app/(frontend)/components/emails/InvoiceReceipt'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

const resend = new Resend(process.env.RESEND_API_KEY!)

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      console.error('No Stripe signature found')
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    console.log('Received Stripe webhook event:', event.type)

    const payload = await getPayload({ config })

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session, payload)
        break

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription, payload)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription, payload)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription, payload)
        break

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice, payload)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice, payload)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 })
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session, payload: any) {
  console.log('Processing checkout session completed:', session.id)
  console.log('Session data:', {
    id: session.id,
    customer_email: session.customer_email,
    customer: session.customer,
    subscription: session.subscription,
    mode: session.mode,
    metadata: session.metadata,
  })

  if (session.mode === 'subscription' && session.subscription) {
    try {
      // Get the subscription details with expanded data
      const subscription = (await stripe.subscriptions.retrieve(session.subscription as string, {
        expand: ['items.data.price.product'],
      })) as Stripe.Subscription

      console.log('Full subscription object:', JSON.stringify(subscription, null, 2))
      console.log('Subscription data:', {
        id: subscription.id,
        customer: subscription.customer,
        status: subscription.status,
        current_period_end: subscription.items.data[0]?.current_period_end,
        current_period_start: subscription.items.data[0]?.current_period_start,
        items: subscription.items.data.map((item) => ({
          price_id: item.price.id,
          product: item.price.product,
        })),
      })

      // Try to find user by customer ID first, then by email
      let user = null
      let userEmail = session.customer_email

      // If no email in session, try to get it from the customer
      if (!userEmail && session.customer) {
        try {
          const customer = await stripe.customers.retrieve(session.customer as string)
          if (customer && typeof customer === 'object' && 'email' in customer) {
            userEmail = customer.email
            console.log('Found customer email:', userEmail)
          }
        } catch (error) {
          console.error('Error retrieving customer:', error)
        }
      }

      // Try to find user by customer ID first
      if (session.customer) {
        try {
          const users = await payload.find({
            collection: 'users',
            where: {
              stripeCustomerId: {
                equals: session.customer as string,
              },
            },
          })

          if (users.docs.length > 0) {
            user = users.docs[0]
            console.log(`Found user by customer ID: ${user.email}`)
          }
        } catch (error) {
          console.error('Error finding user by customer ID:', error)
        }
      }

      // If no user found by customer ID, try by email
      if (!user && userEmail) {
        try {
          const users = await payload.find({
            collection: 'users',
            where: {
              email: {
                equals: userEmail,
              },
            },
          })

          if (users.docs.length > 0) {
            user = users.docs[0]
            console.log(`Found user by email: ${user.email}`)
          }
        } catch (error) {
          console.error('Error finding user by email:', error)
        }
      }

      // Now handle the user update
      if (user) {
        try {
          // Update user with subscription info
          await payload.update({
            collection: 'users',
            id: user.id,
            data: {
              stripeCustomerId: subscription.customer as string,
              stripeSubscriptionId: subscription.id,
              subscriptionStatus: subscription.status,
              subscriptionPlan: subscription.items.data[0]?.price.id,
              planPriceId: subscription.items.data[0]?.price.id,
              subscriptionCurrentPeriodEnd: (() => {
                const periodEnd = subscription.current_period_end
                if (periodEnd && typeof periodEnd === 'number') {
                  return new Date(periodEnd * 1000).toISOString()
                }
                console.log('Warning: Invalid current_period_end:', periodEnd)
                return new Date().toISOString() // fallback to current date
              })(),
            },
          })

          console.log(`✅ Updated user ${user.email} with subscription ${subscription.id}`)
        } catch (error) {
          console.error('Error updating user:', error)
        }
      } else {
        // User doesn't exist - check if we should create one
        const shouldCreateAccount = session.metadata?.createAccount === 'true'

        if (shouldCreateAccount && userEmail) {
          try {
            // Create new user account
            const customerName = session.metadata?.customerName || ''
            const [firstName, ...lastNameParts] = customerName.split(' ')
            const lastName = lastNameParts.join(' ') || ''

            // Generate a temporary password (user will need to reset it)
            const tempPassword = Math.random().toString(36).slice(-8)

            user = await payload.create({
              collection: 'users',
              data: {
                email: userEmail,
                firstName: firstName || '',
                lastName: lastName || '',
                password: tempPassword,
                role: 'user',
                stripeCustomerId: subscription.customer as string,
                stripeSubscriptionId: subscription.id,
                subscriptionStatus: subscription.status,
                subscriptionPlan: subscription.items.data[0]?.price.id,
                subscriptionCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
              },
            })

            console.log(`✅ Created new user ${user.email} with subscription ${subscription.id}`)
            console.log(`Temporary password: ${tempPassword} (user should reset this)`)
          } catch (error) {
            console.error('Error creating user:', error)
          }
        } else {
          console.log(
            `❌ No user found and createAccount is ${shouldCreateAccount}. Email: ${userEmail}`,
          )
        }
      }
    } catch (error) {
      console.error('Error handling checkout session:', error)
    }
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription, payload: any) {
  console.log('Processing subscription created:', subscription.id)

  try {
    // Find user by customer ID
    const users = await payload.find({
      collection: 'users',
      where: {
        stripeCustomerId: {
          equals: subscription.customer as string,
        },
      },
    })

    if (users.docs.length > 0) {
      const user = users.docs[0]

      await payload.update({
        collection: 'users',
        id: user.id,
        data: {
          stripeSubscriptionId: subscription.id,
          subscriptionStatus: subscription.status,
          subscriptionPlan: subscription.items.data[0]?.price.id,
          planPriceId: subscription.items.data[0]?.price.id,
          subscriptionCurrentPeriodEnd: new Date(
            subscription.current_period_end * 1000,
          ).toISOString(),
        },
      })

      console.log(`Updated user ${user.email} with subscription ${subscription.id}`)
    } else {
      console.log(`No user found for customer ${subscription.customer}`)
    }
  } catch (error) {
    console.error('Error handling subscription created:', error)
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription, payload: any) {
  console.log('Processing subscription updated:', subscription.id)
  console.log('Subscription status:', subscription.status)
  console.log('Cancel at period end:', subscription.cancel_at_period_end)

  try {
    // Find user by subscription ID
    const users = await payload.find({
      collection: 'users',
      where: {
        stripeSubscriptionId: {
          equals: subscription.id,
        },
      },
    })

    if (users.docs.length > 0) {
      const user = users.docs[0]
      console.log(`Found user: ${user.email}`)

      // Determine the effective status
      let effectiveStatus = subscription.status

      // If subscription is canceled but still active, mark as canceled
      if (subscription.cancel_at_period_end && subscription.status === 'active') {
        effectiveStatus = 'canceled'
        console.log(`Subscription is canceled but active until period end. Marking as canceled.`)
      }

      await payload.update({
        collection: 'users',
        id: user.id,
        data: {
          subscriptionStatus: effectiveStatus,
          subscriptionCurrentPeriodEnd: (() => {
            const periodEnd = subscription.current_period_end
            if (periodEnd && typeof periodEnd === 'number') {
              return new Date(periodEnd * 1000).toISOString()
            }
            console.log('Warning: Invalid current_period_end:', periodEnd)
            return new Date().toISOString() // fallback to current date
          })(),
          cancelAt: subscription.cancel_at_period_end
            ? new Date(subscription.cancel_at_period_end * 1000).toISOString()
            : undefined,
        },
      })

      console.log(`Updated user ${user.email} subscription status to ${effectiveStatus}`)
    } else {
      console.log(`No user found with subscription ID: ${subscription.id}`)
    }
  } catch (error) {
    console.error('Error handling subscription updated:', error)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription, payload: any) {
  console.log('Processing subscription deleted:', subscription.id)

  try {
    // Find user by subscription ID
    const users = await payload.find({
      collection: 'users',
      where: {
        stripeSubscriptionId: {
          equals: subscription.id,
        },
      },
    })

    if (users.docs.length > 0) {
      const user = users.docs[0]

      await payload.update({
        collection: 'users',
        id: user.id,
        data: {
          subscriptionStatus: 'canceled',
          stripeSubscriptionId: null,
          canceledAt: new Date().toISOString(),
          subscriptionCurrentPeriodEnd: (() => {
            const periodEnd = subscription.items.data[0]?.current_period_end
            if (periodEnd && typeof periodEnd === 'number') {
              return new Date(periodEnd * 1000).toISOString()
            }
            return new Date().toISOString()
          })(),
        },
      })

      console.log(`Marked user ${user.email} subscription as canceled`)
    }
  } catch (error) {
    console.error('Error handling subscription deleted:', error)
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice, payload: any) {
  console.log('Processing invoice payment succeeded:', invoice.id)

  try {
    // Get customer email from invoice
    let customerEmail = invoice.customer_email
    let customerName = ''

    // If no email on invoice, try to get it from the customer
    if (!customerEmail && invoice.customer) {
      try {
        const customer = await stripe.customers.retrieve(invoice.customer as string)
        if (customer && typeof customer === 'object' && 'email' in customer) {
          customerEmail = customer.email
          customerName = customer.name || ''
        }
      } catch (error) {
        console.error('Error retrieving customer:', error)
      }
    }

    // Find user by subscription ID or customer ID
    let user = null
    if ((invoice as any).subscription) {
      const users = await payload.find({
        collection: 'users',
        where: {
          stripeSubscriptionId: {
            equals: (invoice as any).subscription as string,
          },
        },
      })

      if (users.docs.length > 0) {
        user = users.docs[0]
      }
    }

    // If no user found by subscription, try by customer ID
    if (!user && invoice.customer) {
      const users = await payload.find({
        collection: 'users',
        where: {
          stripeCustomerId: {
            equals: invoice.customer as string,
          },
        },
      })

      if (users.docs.length > 0) {
        user = users.docs[0]
      }
    }

    // If no user found by customer ID, try by email
    if (!user && customerEmail) {
      const users = await payload.find({
        collection: 'users',
        where: {
          email: {
            equals: customerEmail,
          },
        },
      })

      if (users.docs.length > 0) {
        user = users.docs[0]
      }
    }

    // Update user if found
    if (user) {
      await payload.update({
        collection: 'users',
        id: user.id,
        data: {
          lastPaymentDate: new Date(),
          subscriptionStatus: 'active', // Ensure status is active after successful payment
        },
      })

      console.log(`Updated user ${user.email} after successful payment`)
    }

    // Send invoice/receipt email
    if (customerEmail) {
      try {
        // Format amount
        const amount = (invoice.amount_paid / 100).toFixed(2)
        const currency = invoice.currency.toUpperCase()
        const date = new Date(invoice.created * 1000).toLocaleDateString()

        // Get description from invoice lines
        let description = 'Subscription payment'
        if (invoice.lines.data.length > 0) {
          const line = invoice.lines.data[0]
          if (line.description) {
            description = line.description
          } else if (
            line.price?.product &&
            typeof line.price.product === 'object' &&
            'name' in line.price.product
          ) {
            description = (line.price.product as any).name
          }
        }

        // Generate URLs
        const appUrl = process.env.NEXT_PUBLIC_APP_URL!
        const receiptUrl = invoice.hosted_invoice_url || `${appUrl}/dashboard/billing`
        const customerPortalUrl = `${appUrl}/dashboard/billing`

        // Render and send email
        const emailHtml = await render(
          InvoiceReceipt({
            brandName: process.env.BRAND_NAME || 'Your App',
            logoUrl: process.env.BRAND_LOGO_URL,
            appUrl,
            userName: user?.firstName || customerName || '',
            invoiceNumber: invoice.number || invoice.id,
            amount,
            currency,
            date,
            description,
            receiptUrl,
            customerPortalUrl,
          }),
        )

        await resend.emails.send({
          from: process.env.EMAIL_FROM!,
          to: [customerEmail],
          subject: `Payment Receipt - ${process.env.BRAND_NAME || 'Your App'}`,
          html: emailHtml,
        })

        console.log(`✅ Invoice/receipt email sent to ${customerEmail}`)
        console.log(`📧 Invoice: ${invoice.number || invoice.id}`)
        console.log(`💰 Amount: ${amount} ${currency}`)
      } catch (error) {
        console.error('Error sending invoice/receipt email:', error)
      }
    } else {
      console.log('No customer email found for invoice, skipping receipt email')
    }
  } catch (error) {
    console.error('Error handling invoice payment succeeded:', error)
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice, payload: any) {
  console.log('Processing invoice payment failed:', invoice.id)

  if ((invoice as any).subscription) {
    try {
      // Find user by subscription ID
      const users = await payload.find({
        collection: 'users',
        where: {
          stripeSubscriptionId: {
            equals: invoice.subscription as string,
          },
        },
      })

      if (users.docs.length > 0) {
        const user = users.docs[0]

        await payload.update({
          collection: 'users',
          id: user.id,
          data: {
            subscriptionStatus: 'past_due',
          },
        })

        console.log(`Marked user ${user.email} subscription as past due`)
      }
    } catch (error) {
      console.error('Error handling invoice payment failed:', error)
    }
  }
}
