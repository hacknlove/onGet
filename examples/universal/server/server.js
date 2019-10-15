/* eslint-disable no-console, no-use-before-define */

import Express from 'express'
import qs from 'qs'
import webpack from 'webpack'
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'
import webpackConfig from '../webpack.config'
import { start, end, save, set } from 'onget'
import React from 'react'
import { renderToString } from 'react-dom/server'

import App from '../common/components/App'

const app = new Express()
const port = 3000

var counter = 0
app.get('/api/v1/counter', (req, res) => {
  res.json(counter)
})

app.post('/api/v1/counter', (req, res) => {
  counter += req.body.counter
  res.json({ ok: true})
})


// Use this middleware to set up hot module reloading via webpack.
const compiler = webpack(webpackConfig)
app.use(webpackDevMiddleware(compiler, { noInfo: true, publicPath: webpackConfig.output.publicPath }))
app.use(webpackHotMiddleware(compiler))

async function handleRender (req, res) {
  await start()

  await set('dotted://counter', 5)
  await set('/api/v1/counter', counter)

  const html = renderToString(
    <App/>
  )

  const finalState = save()
  console.log(JSON.stringify(finalState, null, 4))
  const rendered = renderFullPage(html, finalState)
  end()
  // Send the rendered page back to the client
  res.send(rendered)
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
