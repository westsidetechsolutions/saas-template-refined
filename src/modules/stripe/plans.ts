import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

export interface StripePlan {
  id: string
  name: string
  description: string | null
  metadata: Record<string, string>
  default_price: any
  images: string[]
}

export const fetchPlans = async (): Promise<StripePlan[]> => {
  // Fetch all products with the specific metadata
  const products = await stripe.products.list({
    expand: ['data.default_price'],
    active: true,
  })

  // Filter products by metadata
  const filteredProducts = products.data.filter(
    (product) => product.metadata?.app === (process.env.STRIPE_APP_NAME || 'saas-app'),
  )

  // Format the response
  return filteredProducts.map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    metadata: product.metadata,
    default_price: product.default_price,
    images: product.images,
  }))
}

export const getProductByPriceId = async (priceId: string): Promise<StripePlan | null> => {
  try {
    // First get the price to find the product ID
    const price = await stripe.prices.retrieve(priceId, {
      expand: ['product'],
    })

    if (!price.product || typeof price.product === 'string') {
      return null
    }

    const product = price.product as Stripe.Product

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      metadata: product.metadata,
      default_price: price,
      images: product.images,
    }
  } catch (error) {
    console.error('Error fetching product by price ID:', error)
    return null
  }
}
