/* global fetch */

const plugin = {
  name: 'fetch',
  regex: /^./,
  checkInterval: 30000,
  threshold: 500,
  async refresh (endpoint, eventHandler) {
    const response = await fetch(endpoint.url).catch(__error => ({ __error }))
    if (response.__error) {
      return eventHandler(response.__error)
    }
    const raw = await response.text()
    let value
    try {
      value = JSON.parse(raw)
    } catch (e) {
      value = raw
    }
    eventHandler(value)
  },
  start () {
    plugin.checkInterval = undefined
    plugin.threshold = undefined
  }
}

export default plugin
