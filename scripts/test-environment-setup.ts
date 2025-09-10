#!/usr/bin/env tsx

import { config as dotenvConfig } from 'dotenv'
import path from 'path'

// Load environment variables from test.env
dotenvConfig({ path: path.resolve(process.cwd(), 'test.env') })

async function checkEnvironment() {
  console.log('🔍 Checking test environment setup...\n')

  const requiredEnvVars = [
    'PAYLOAD_SECRET',
    'DATABASE_URI',
  ]

  const missingVars = []
  const envVars = {}

  for (const varName of requiredEnvVars) {
    const value = process.env[varName]
    envVars[varName] = value ? '✅ Set' : '❌ Missing'
    
    if (!value) {
      missingVars.push(varName)
    }
  }

  console.log('Environment Variables:')
  console.log('=====================')
  
  for (const [varName, status] of Object.entries(envVars)) {
    console.log(`${status} ${varName}`)
  }

  if (missingVars.length > 0) {
    console.log('\n❌ Missing required environment variables:')
    missingVars.forEach(varName => {
      console.log(`   - ${varName}`)
    })
    
    console.log('\n💡 To fix this:')
    console.log('1. Make sure test.env file exists in the project root')
    console.log('2. Add the missing variables to test.env:')
    console.log('   PAYLOAD_SECRET="your-secret-key"')
    console.log('   DATABASE_URI="mongodb://localhost:27017/your-database"')
    console.log('3. Ensure your database is running')
    
    process.exit(1)
  }

  console.log('\n✅ Environment setup looks good!')
  console.log('\n📋 Next steps:')
  console.log('1. Ensure your database is running')
  console.log('2. Run: npm run test-entitlements-all')
  
  return true
}

checkEnvironment()
  .then(() => {
    console.log('\n🎉 Environment check completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Environment check failed:', error)
    process.exit(1)
  })
