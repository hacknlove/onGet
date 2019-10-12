/* eslint-disable no-console, no-use-before-define */

import Express from 'express'
import qs from 'qs'
import webpack from 'webpack'
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'
import webpackConfig from '../webpack.config'
import { start, end } from 'onget'
import React from 'react'
import { renderToString } from 'react-dom/server'

import App from '../common/components/App'
import { fetchCounter } from '../common/api/counter'

const app = new Express()
const port = 3000

// Use this middleware to set up hot module reloading via webpack.
const compiler = webpack(webpackConfig)
app.use(webpackDevMiddleware(compiler, { noInfo: true, publicPath: webpackConfig.output.publicPath }))
app.use(webpackHotMiddleware(compiler))

const handleRender = (req, res) => {
  // Query our mock API asynchronously
  fetchCounter(apiResult => {
    // Read the counter from the request, if provided
    const params = qs.parse(req.query)
    const counter = parseInt(params.counter, 10) || apiResult || 0

    // Compile an initial state
    const preloadedState = { counter }

    // Render the component to a string
    start()
    const html = renderToString(
      <App/>
    )

    const finalState = {}
    const rendered = renderFullPage(html, finalState)
    end()
    // Send the rendered page back to the client
    res.send(rendered)
  })
}

// This is fired every time the server side receives a request
app.get('/', handleRender)

const renderFullPage = (html, preloadedState) => {
  return `
    <!doctype html>
    <html>
      <head>
        <title>Redux Universal Example</title>
      </head>
      <body>
        <div id="app">${html}</div>
        <script>
          window.__PRELOADED_STATE__ = ${JSON.stringify(preloadedState).replace(/</g, '\\x3c')}
        </script>
        <script src="/static/bundle.js"></script>
      </body>
    </html>
    `
}

app.listen(port, (error) => {
  if (error) {
    console.error(error)
  } else {
    console.info(`==> 🌎  Listening on port ${port}. Open up http://localhost:${port}/ in your browser.`)
  }
})
