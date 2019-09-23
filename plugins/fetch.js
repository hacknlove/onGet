/* global fetch */

export const plugin = {
  name: 'fetch',
  regex: /^./,
  checkInterval: 30,
  threshold: 500,
  async refresh (endpoint, eventHandler) {
    const response = await fetch(endpoint.url).catch(error => ({ error }))

    if (response.error) {
      return eventHandler(response.error)
    }

    if (!response.ok) {
      return eventHandler({
        error: await response.json().catch(async () => response.text())
      })
    }

    eventHandler({
      response: await response.json().catch(async () => response.text())
    })
  },
  clean () {

  },
  unsuscribe () {

  },
  getEndpoint () {

  },
  get () {
    
  }
}
