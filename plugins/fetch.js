/* global fetch */

const plugin = {
  name: 'fetch',
  regex: /^./,
  checkInterval: 30000,
  threshold: 500,
  async refresh (endpoint, eventHandler) {
    const response = await fetch(endpoint.url).catch(error => ({ error }))
    if (response.error) {
      return eventHandler(response.error)
    }
    eventHandler(await response.json().catch(async () => response.text()))
  }
}

export default plugin
