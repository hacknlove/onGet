import '@babel/polyfill'
import React from 'react'
import { render } from 'react-dom'
import App from '../common/components/App'
import { beforeSet, load } from 'onget'

const rootElement = document.getElementById('app')

load(__PRELOADED_STATE__)

beforeSet('/api/v1/counter', event => {
  fetch()
  console.log(end)
  console.log(event)
})

render(
  <App/>,
  rootElement
)
