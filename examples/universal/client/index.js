import '@babel/polyfill'
import React from 'react'
import { render } from 'react-dom'
import App from '../common/components/App'
import { beforeSet } from 'onget'

const rootElement = document.getElementById('app')

beforeSet('/api/counter', event => {
  console.log(event)
})

render(
  <App/>,
  rootElement
)
