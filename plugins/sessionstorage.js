/* global sessionStorage */
const PROTOCOLCUT = 'sessionStorage://'.length

function parseIfPossible (value) {
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

export default {
  name: 'sessionStorage',
  regex: /^sessionStorage:\/\/./i,
  checkInterval: 30000,
  threshold: 500,
  refresh (endpoint, eventHandler) {
    eventHandler(sessionStorage[endpoint.key])
  },
  getEndpoint (endpoint) {
    endpoint.key = endpoint.url.substr(PROTOCOLCUT)

    if (sessionStorage[endpoint.key] !== undefined) {
      endpoint.value = parseIfPossible(sessionStorage[endpoint.key])
      return
    }
    sessionStorage[endpoint.key] = JSON.stringify(endpoint.value)
  },
  get (url) {
    return parseIfPossible(sessionStorage[url.substr(PROTOCOLCUT)])
  },
  set (endpoint) {
    sessionStorage[endpoint.key] = JSON.stringify(endpoint.value)
  },

  start () {
    global.sessionStorage = {}
  }
}
