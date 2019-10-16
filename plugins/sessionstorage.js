/* global sessionStorage */
const PROTOCOLCUT = 'sessionStorage://'.length

function parseIfPossible (value) {
  try {
    return JSON.parse(value)
  } catch (e) {
    return value
  }
}

const plugin = {
  name: 'sessionStorage',
  regex: /^sessionStorage:\/\/./i,
  refresh (resource, eventHandler) {
    eventHandler(parseIfPossible(sessionStorage[resource.key]))
  },
  getResource (resource) {
    resource.key = resource.url.substr(PROTOCOLCUT)

    if (sessionStorage[resource.key] !== undefined) {
      resource.value = parseIfPossible(sessionStorage[resource.key])
      return
    }
    sessionStorage[resource.key] = JSON.stringify(resource.value)
  },
  get (url) {
    return parseIfPossible(sessionStorage[url.substr(PROTOCOLCUT)])
  },
  set (resource) {
    sessionStorage[resource.key] = JSON.stringify(resource.value)
  },

  start () {
    global.sessionStorage = {}
  }
}

export default plugin
