import '@babel/polyfill'
import React from 'react'
import { render } from 'react-dom'
import App from '../common/components/App'
import { afterSet, load, get } from 'onget'

const rootElement = document.getElementById('app')

load(__PRELOADED_STATE__)

afterSet('/api/v1/counter', async event => {
  const delta = event.oldValue - event.newValue
  const respose = await fetch(`/api/v1/counter/${delta}`, {
    method: 'POST',
  })
  const counter = await response.json()

  if (counter !== event.newValue) {

  }
})

render(
  <App/>,
  rootElement
)
