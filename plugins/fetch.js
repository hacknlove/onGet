/* global fetch */

const plugin = {
  name: 'fetch',
  regex: /^./,
  checkInterval: 30000,
  threshold: 500,
  refresh (endpoint, eventHandler) {
    return fetch(endpoint.url)
      .then(response => {
        response.json()
          .then(eventHandler)
          .catch(() => {
            response.text()
              .then(eventHandler)
              .catch(eventHandler)
          })
      })
      .catch(eventHandler)
  }
}

export default plugin
