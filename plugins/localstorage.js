/* global localStorage */
const PROTOCOLCUT = 'localStorage://'.length

function parseIfPossible (value) {
  try {
    return JSON.parse(value)
  } catch (e) {
    return value
  }
}

export function onChange (endpoint) {
  if (!global.addEventListener || !global.removeEventListener) {
    return
  }
  function listener () {
    if (localStorage[endpoint.key] === JSON.stringify(endpoint.value)) {
      return
    }
    endpoint.value = parseIfPossible(localStorage[endpoint.key])
    Object.values(endpoint.callbacks).forEach(cb => cb(endpoint.value))
  }
  global.addEventListener('storage', listener)
  return () => {
    global.removeEventListener(listener)
  }
}

const plugin = {
  name: 'localStorage',
  regex: /^localStorage:\/\/./i,
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
    endpoint.unsubscribeStorage = onChange(endpoint)
  },
  get (url) {
    return parseIfPossible(localStorage[url.substr(PROTOCOLCUT)])
  },
  set (endpoint) {
    localStorage[endpoint.key] = JSON.stringify(endpoint.value)
  },
  clean (endpoint) {
    endpoint.unsubscribeStorage && endpoint.unsubscribeStorage()
  },
  start () {
    plugin.checkInterval = 0
    plugin.threshold = undefined
    global.localStorage = {}
  }
}

export default plugin
