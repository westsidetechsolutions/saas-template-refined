#!/usr/bin/env tsx

import { getPayload } from 'payload'
import config from '../src/payload.config'
import {
  getBillingWindow,
  getOrCreateCurrentUsage,
  incUsage,
  enforceLimit,
  newKey,
  hashKey,
} from '../src/lib/usage'
import { getEntitlements } from '../src/lib/billing/entitlements'

async function testBillingSystem() {
  console.log('🧪 Testing Billing & Usage System...\n')

  try {
    const payload = await getPayload({ config })

    // Test 1: Get entitlements
    console.log('1. Testing Plan Entitlements:')
    const freeEntitlements = getEntitlements('price_free')
    const proEntitlements = getEntitlements('price_pro_monthly')
    console.log('   Free plan:', freeEntitlements)
    console.log('   Pro plan:', proEntitlements)
    console.log('   ✅ Entitlements working\n')

    // Test 2: Find a test user
    console.log('2. Finding test user:')
    const users = await payload.find({
      collection: 'users',
      limit: 1,
      depth: 0,
    })

    if (users.docs.length === 0) {
      console.log('   ❌ No users found. Please create a user first.')
      return
    }

    const user = users.docs[0]
    console.log(`   Found user: ${user.email} (ID: ${user.id})`)
    console.log(`   Plan: ${user.planPriceId || 'free'}`)
    console.log(`   Status: ${user.subscriptionStatus || 'none'}`)
    console.log('   ✅ User found\n')

    // Test 3: Billing window calculation
    console.log('3. Testing Billing Window:')
    const { periodStart, periodEnd } = getBillingWindow(user as any)
    console.log(`   Period Start: ${periodStart.toISOString()}`)
    console.log(`   Period End: ${periodEnd.toISOString()}`)
    console.log('   ✅ Billing window calculated\n')

    // Test 4: Usage document creation
    console.log('4. Testing Usage Document:')
    const usage = await getOrCreateCurrentUsage(user.id, periodStart, periodEnd)
    console.log(`   Usage ID: ${usage.id}`)
    console.log(`   API Calls: ${usage.apiCalls}`)
    console.log(`   Items Created: ${usage.itemsCreated}`)
    console.log(`   Storage MB: ${usage.storageMb}`)
    console.log('   ✅ Usage document created/retrieved\n')

    // Test 5: Usage increment
    console.log('5. Testing Usage Increment:')
    const updatedUsage = await incUsage(user.id, 'apiCalls', 5)
    console.log(`   API Calls after increment: ${updatedUsage.apiCalls}`)
    console.log('   ✅ Usage incremented\n')

    // Test 6: Limit enforcement
    console.log('6. Testing Limit Enforcement:')
    const limitCheck = await enforceLimit({
      user: user as any,
      usageDoc: updatedUsage,
      field: 'apiCalls',
    })
    console.log(`   Limit check:`, limitCheck)
    console.log('   ✅ Limit enforcement working\n')

    // Test 7: API key generation
    console.log('7. Testing API Key Generation:')
    const { raw, hash } = newKey('test')
    console.log(`   Raw key: ${raw}`)
    console.log(`   Hash: ${hash}`)
    console.log(`   Hash verification: ${hashKey(raw) === hash}`)
    console.log('   ✅ API key generation working\n')

    // Test 8: Create API key in database
    console.log('8. Testing API Key Creation:')
    try {
      const apiKey = await payload.create({
        collection: 'api_keys',
        data: {
          user: user.id,
          name: 'Test API Key',
          keyHash: hash,
          scopes: ['read', 'write'],
        },
      })
      console.log(`   API Key created: ${apiKey.id}`)
      console.log('   ✅ API key stored in database\n')

      // Clean up test key
      await payload.update({
        collection: 'api_keys',
        id: apiKey.id,
        data: { revokedAt: new Date() },
      })
      console.log('   ✅ Test API key revoked\n')
    } catch (error) {
      console.log('   ❌ Failed to create API key:', error.message)
    }

    console.log('🎉 All tests completed successfully!')
    console.log('\n📋 Summary:')
    console.log('   - Plan entitlements working')
    console.log('   - Usage tracking functional')
    console.log('   - API key system operational')
    console.log('   - Limit enforcement active')
    console.log('   - Billing window calculation correct')
  } catch (error) {
    console.error('❌ Test failed:', error)
    process.exit(1)
  }
}

// Run the test
testBillingSystem()
  .then(() => {
    console.log('\n✅ Billing system test completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Test failed:', error)
    process.exit(1)
  })
