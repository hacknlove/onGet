/* global fetch */

const plugin = {
  name: 'fetch',
  fetch: fetch,
  regex: /^./,
  checkInterval: 30,
  threshold: 500,
  async refresh (endpoint, eventHandler) {
    const response = await plugin.fetch(endpoint.url).catch(error => ({ error }))
    if (response.error) {
      return eventHandler(response.error)
    }

    eventHandler(await response.json().catch(async () => response.text()))
  }
}

export default plugin
