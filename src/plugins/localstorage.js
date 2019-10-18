/* global localStorage */
const PROTOCOLCUT = 'localStorage://'.length

function parseIfPossible (value) {
  try {
    return JSON.parse(value)
  } catch (e) {
    return value
  }
}

export function onChange (resource) {
  if (!global.addEventListener || !global.removeEventListener) {
    return
  }
  function listener () {
    if (localStorage[resource.key] === JSON.stringify(resource.value)) {
      return
    }
    resource.value = parseIfPossible(localStorage[resource.key])
    Object.values(resource.callbacks).forEach(cb => cb(resource.value))
  }
  global.addEventListener('storage', listener)
  return () => {
    global.removeEventListener(listener)
  }
}

const plugin = {
  name: 'localStorage',
  regex: /^localStorage:\/\/./i,
  refresh (resource) {
    return parseIfPossible(localStorage[resource.key])
  },
  getResource (resource) {
    resource.unsubscribeStorage = onChange(resource)
    resource.key = resource.url.substr(PROTOCOLCUT)

    if (localStorage[resource.key] !== undefined) {
      resource.value = parseIfPossible(localStorage[resource.key])
      return
    }
    localStorage[resource.key] = JSON.stringify(resource.value)
  },
  get (url) {
    return parseIfPossible(localStorage[url.substr(PROTOCOLCUT)])
  },
  set (resource) {
    localStorage[resource.key] = JSON.stringify(resource.value)
  },
  clean (resource) {
    resource.unsubscribeStorage && resource.unsubscribeStorage()
  },
  start () {
    global.localStorage = {}
  }
}

export default plugin
