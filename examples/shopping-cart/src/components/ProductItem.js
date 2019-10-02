/* global fetch */
import React from 'react'
import Product from './Product'
import { refresh,get, set } from 'onget'

async function addToCart (product) {
  await fetch(`/api/cart/${product.id}`, {
    method: 'post'
  })

  // we know that the value at /api/cart has changed so we call refresh to avoid waiting for the periodicall check
  refresh('/api/cart')

  // we know that the inventory should have been reduced by one, so we can optimistically set the new expected value at /api/product
  const products = [...get('/api/products')]
  products[product.id] = {
    ...products[product.id],
    inventory: products[product.id].inventory - 1
  }
  set('/api/products', products)
}

export default function ProductItem ({ product }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <Product
        title={product.title}
        price={product.price}
        quantity={product.inventory} />
      <button
        onClick={() => product.inventory && addToCart(product)}
        disabled={product.inventory > 0 ? '' : 'disabled'}>
        {product.inventory > 0 ? 'Add to cart' : 'Sold Out'}
      </button>
    </div>
  )
}
