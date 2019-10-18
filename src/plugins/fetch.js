/* global fetch */

const plugin = {
  name: 'fetch',
  regex: /^./,
  checkInterval: 30000,
  threshold: 500,
  async refresh (resource) {
    const response = await fetch(resource.url).catch(__error => ({ __error }))
    if (response.__error) {
      return response.__error
    }
    const raw = await response.text()
    let value
    try {
      value = JSON.parse(raw)
    } catch (e) {
      value = raw
    }
    return value
  },
  start () {
    plugin.checkInterval = undefined
    plugin.threshold = undefined
  }
}

export default plugin
