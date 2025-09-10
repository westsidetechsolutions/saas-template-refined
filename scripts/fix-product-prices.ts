import 'dotenv/config'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

async function fixProductPrices() {
  try {
    console.log('Fetching products...')

    // Get all products with the app metadata
    const products = await stripe.products.list({
      active: true,
    })

    const appProducts = products.data.filter(
      (product) => product.metadata?.app === (process.env.STRIPE_APP_NAME || 'saas-app'),
    )

    console.log(`Found ${appProducts.length} products to fix`)

    for (const product of appProducts) {
      console.log(`\nProcessing product: ${product.name} (${product.id})`)

      // Get all prices for this product
      const prices = await stripe.prices.list({
        product: product.id,
        active: true,
      })

      if (prices.data.length === 0) {
        console.log(`  ❌ No prices found for product ${product.name}`)
        continue
      }

      // Use the first price as default
      const defaultPrice = prices.data[0]
      console.log(
        `  Found price: ${defaultPrice.id} - $${(defaultPrice.unit_amount! / 100).toFixed(2)}/${defaultPrice.recurring?.interval}`,
      )

      // Update the product to set the default price
      await stripe.products.update(product.id, {
        default_price: defaultPrice.id,
      })

      console.log(`  ✅ Set default price for ${product.name}`)
    }

    console.log('\n🎉 All products have been updated with default prices!')
  } catch (error) {
    console.error('Error fixing product prices:', error)
    process.exit(1)
  }
}

fixProductPrices()
