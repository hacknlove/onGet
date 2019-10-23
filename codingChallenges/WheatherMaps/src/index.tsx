import React from 'react'
import ReactDOM from 'react-dom'
import * as serviceWorker from './serviceWorker'
import './API'
import App from './App'

import './index.scss'

ReactDOM.render(
  <App />,
  document.getElementById('root')
)

serviceWorker.unregister()
