const express = require('express')
const products = require('./products.json')

const app = express()

const cart = []

app.get('/api/products', (req, res) => {
  res.json(products)
})

app.get('/api/cart', (req, res) => {
  res.json(cart)
})

app.post('/api/cart/:id', (req, res) => {
  const id = req.params.id * 1
  products[id].inventory--

  if (cart.every(item => {
    if (item.id !== id) {
      return true
    }
    item.quantity++
  })) {
    cart.push({
      id: products[id].id,
      title: products[id].title,
      price: products[id].price,
      quantity: 1
    })
  }

  res.json({ ok: true })
})

app.post('/api/buy', (req, res) => {
  cart.length = 0
  res.json({ ok: true })
})

app.listen(3001, () => console.log('server started'))
