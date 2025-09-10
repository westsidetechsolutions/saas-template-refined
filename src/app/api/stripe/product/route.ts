import { NextRequest, NextResponse } from 'next/server'
import { getProductByPriceId } from '@/modules/stripe/plans'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const priceId = searchParams.get('priceId')

    if (!priceId) {
      return NextResponse.json({ error: 'Price ID is required' }, { status: 400 })
    }

    const product = await getProductByPriceId(priceId)

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Format the product for the client
    const features = product.metadata?.features?.split(',') || []
    const price = product.default_price?.unit_amount || 0
    const isHighlight = product.metadata?.highlight === 'true'

    const formattedProduct = {
      id: product.id,
      name: product.name,
      description: product.description || '',
      metadata: product.metadata,
      default_price: product.default_price,
      features,
      price,
      highlight: isHighlight,
    }

    return NextResponse.json(formattedProduct)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}
