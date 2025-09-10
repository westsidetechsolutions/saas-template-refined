import 'dotenv/config'
import { fetchPlans } from '../src/modules/stripe/plans'

async function main() {
  try {
    console.log('Fetching products...')
    const products = await fetchPlans()
    
    console.log('\n📦 Products found:')
    console.log('==================')
    
    if (products.length === 0) {
      console.log('No products found.')
    } else {
      products.forEach((product, index) => {
        console.log(`\n${index + 1}. ${product.name}`)
        console.log(`   Description: ${product.description || 'No description'}`)
        console.log(`   ID: ${product.id}`)
        console.log(`   Images: ${product.images.length > 0 ? product.images.join(', ') : 'No images'}`)
        
        if (product.default_price) {
          console.log(`   Price ID: ${product.default_price.id}`)
          console.log(`   Price: $${(product.default_price.unit_amount / 100).toFixed(2)}/${product.default_price.recurring?.interval || 'one-time'}`)
        }
        
        console.log(`   Metadata:`, product.metadata)
      })
    }
    
    console.log(`\n✅ Found ${products.length} product(s)`)
  } catch (error) {
    console.error('Error fetching products:', error)
    process.exit(1)
  }
}

main() 