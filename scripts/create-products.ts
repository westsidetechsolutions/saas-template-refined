import 'dotenv/config'
import createProducts from '../src/init/actions/createProducts'

async function main() {
  try {
    console.log('Creating products...')
    await createProducts()
    console.log('Products created successfully!')
  } catch (error) {
    console.error('Error creating products:', error)
    process.exit(1)
  }
}

main()
