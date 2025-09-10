import mongoose from 'mongoose'

async function testSubscriptionStatus(email: string) {
  try {
    // Connect to MongoDB directly
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/payload-saas'
    await mongoose.connect(mongoUri)
    console.log('Connected to MongoDB')

    // Get the users collection
    const db = mongoose.connection.db
    const usersCollection = db.collection('users')

    // Find the user by email
    const user = await usersCollection.findOne({ email })

    if (!user) {
      console.log(`❌ No user found with email: ${email}`)
      return
    }

    console.log('\n🔍 Subscription Status Check')
    console.log('=====================================')
    console.log(`Email: ${user.email}`)
    console.log(`Name: ${user.firstName} ${user.lastName}`)
    console.log(`Role: ${user.role}`)
    console.log(`Stripe Customer ID: ${user.stripeCustomerId || 'None'}`)
    console.log(`Stripe Subscription ID: ${user.stripeSubscriptionId || 'None'}`)
    console.log(`Subscription Status: ${user.subscriptionStatus || 'None'}`)
    console.log(`Subscription Plan: ${user.subscriptionPlan || 'None'}`)
    console.log(`Current Period End: ${user.subscriptionCurrentPeriodEnd || 'None'}`)
    console.log(`Last Payment Date: ${user.lastPaymentDate || 'None'}`)
    console.log(`Trial End: ${user.trialEnd || 'None'}`)
    console.log(`Has Used Trial: ${user.hasUsedTrial || false}`)

    // Check subscription logic
    const now = new Date()
    const currentPeriodEnd = user.subscriptionCurrentPeriodEnd
      ? new Date(user.subscriptionCurrentPeriodEnd)
      : null

    const isActive = user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trialing'
    const isCanceledButActive =
      user.subscriptionStatus === 'canceled' && currentPeriodEnd && currentPeriodEnd > now

    const hasActiveSubscription = isActive || isCanceledButActive

    console.log('\n📊 Subscription Analysis')
    console.log('=====================================')
    console.log(`Current Date: ${now.toISOString()}`)
    console.log(`Current Period End: ${currentPeriodEnd?.toISOString() || 'None'}`)
    console.log(`Is Active: ${isActive}`)
    console.log(`Is Canceled But Active: ${isCanceledButActive}`)
    console.log(`Has Active Subscription: ${hasActiveSubscription}`)

    if (hasActiveSubscription) {
      console.log('\n✅ User should be redirected to DASHBOARD')
    } else {
      console.log('\n❌ User should be redirected to PRICING')
    }

    // Test the API endpoint
    console.log('\n🌐 Testing API Endpoint')
    console.log('=====================================')

    // Note: This would require a valid session token
    // For now, we'll just show what the logic would return
    console.log('API would return:')
    console.log(
      JSON.stringify(
        {
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            subscriptionStatus: user.subscriptionStatus,
            subscriptionCurrentPeriodEnd: user.subscriptionCurrentPeriodEnd,
            lastPaymentDate: user.lastPaymentDate,
            hasActiveSubscription,
          },
          globalSettings: {
            pricingRedirectUrl: '/#pricing',
          },
        },
        null,
        2,
      ),
    )
  } catch (error) {
    console.error('Error checking subscription status:', error)
  } finally {
    await mongoose.disconnect()
    process.exit(0)
  }
}

// Get email from command line argument
const email = process.argv[2]

if (!email) {
  console.log('Usage: npm run test-subscription <email>')
  console.log('Example: npm run test-subscription user@example.com')
  process.exit(1)
}

testSubscriptionStatus(email)
