import React from 'react'
import ProductItem from './ProductItem'
import { useOnGet } from 'onget'

export default function ProductsList () {
  // Just use your API endpoint
  const products = useOnGet('/api/products', {
    first: []
  })

  return (
    <div>
      <h3>Products</h3>
      <div>
        {products.map(product =>
          <ProductItem
            key={product.id}
            product= {product}
          />
        )}
      </div>
    </div>
  )
}
