import '@babel/polyfill'
import React from 'react'
import { render } from 'react-dom'
import App from '../common/components/App'
import { beforeSet, load, get } from 'onget'

const rootElement = document.getElementById('app')

load(__PRELOADED_STATE__)

afterSet('/api/v1/counter', event => {
  // fetch()
  console.log(get('/api/v1/counter'))
  console.log(event)
})

render(
  <App/>,
  rootElement
)
