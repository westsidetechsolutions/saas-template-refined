import { products } from '@/init/data/products'
import { createProduct } from '@/modules/stripe/products'

const createProducts = async () => {
  for (const product of products) {
    await createProduct(product.name, product.description, product.price)
  }
}

export default createProducts
