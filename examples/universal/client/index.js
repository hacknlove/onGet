import 'babel-polyfill'
import React from 'react'
import { render } from 'react-dom'
import App from '../common/components/App'

const rootElement = document.getElementById('app')

render(
  <App/>,
  rootElement
)
