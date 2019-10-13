/* global localStorage */
const PROTOCOLCUT = 'localStorage://'.length

function parseIfPossible (value) {
  try {
    return JSON.parse(value)
  } catch (e) {
    return value
  }
}

const plugin = {
  name: 'localStorage',
  regex: /^localStorage:\/\/./i,
  checkInterval: 30000,
  threshold: 500,
  refresh (endpoint, eventHandler) {
    eventHandler(parseIfPossible(localStorage[endpoint.key]))
  },
  getEndpoint (endpoint) {
    endpoint.key = endpoint.url.substr(PROTOCOLCUT)

    if (localStorage[endpoint.key] !== undefined) {
      endpoint.value = parseIfPossible(localStorage[endpoint.key])
      return
    }
    localStorage[endpoint.key] = JSON.stringify(endpoint.value)
  },
  get (url) {
    return parseIfPossible(localStorage[url.substr(PROTOCOLCUT)])
  },
  set (endpoint) {
    localStorage[endpoint.key] = JSON.stringify(endpoint.value)
  },

  start () {
    plugin.checkInterval = 0
    plugin.threshold = undefined
    global.localStorage = {}
  }
}

export default plugin
