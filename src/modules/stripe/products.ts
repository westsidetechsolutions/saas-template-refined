import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

export const createProduct = async (
  productName: string,
  productDescription: string,
  price: number,
) => {
  try {
    // Create the product first
    const product = await stripe.products.create({
      name: productName,
      description: productDescription,
      metadata: {
        app: process.env.STRIPE_APP_NAME || 'saas-app',
      },
    })

    // Create the price
    const priceObj = await stripe.prices.create({
      unit_amount: price, //1400 = $14
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      product: product.id,
    })

    // Update the product to set the default price
    await stripe.products.update(product.id, {
      default_price: priceObj.id,
    })

    console.log('Success! Here is your starter subscription product id: ' + product.id)
    console.log('Success! Here is your starter subscription price id: ' + priceObj.id)

    return { product, price: priceObj }
  } catch (error) {
    console.error('Error creating product:', error)
    throw error
  }
}
