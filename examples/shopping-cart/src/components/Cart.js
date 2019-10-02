/* global fetch */

import React from 'react'
import Product from './Product'
import { useOnGet, set } from 'onget'

async function buy () {
  await fetch('/api/buy', {
    method: 'POST'
  })
  // optimistically set the expected new value. The real one will come in the next periodicall check
  set('/api/cart', [])
}

export default function Cart () {
  // Just use your API endpoint
  const cart = useOnGet('/api/cart', {
    first: []
  })

  const total = cart.reduce((total, item) => (total + item.price * item.quantity), 0)

  const hasProducts = cart.length > 0

  const nodes = hasProducts ? (
    cart.map(product =>
      <Product
        title={product.title}
        price={product.price}
        quantity={product.quantity}
        key={product.id}
      />
    )
  ) : (
    <em>Please add some products to cart.</em>
  )

  return (
    <div>
      <h3>Your Cart</h3>
      <div>{nodes}</div>
      <p>Total: &#36;{total}</p>
      <button onClick={buy}
        disabled={hasProducts ? '' : 'disabled'}>
        Checkout
      </button>
    </div>
  )
}
