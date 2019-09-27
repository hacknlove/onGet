/* global sessionStorage */
const PROTOCOLCUT = 'sessionStorage://'.length

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
      endpoint.value = sessionStorage[endpoint.key]
      return
    }
    sessionStorage[endpoint.key] = endpoint.value
  },
  get (url) {
    return sessionStorage[url.substr(PROTOCOLCUT)]
  },
  set (endpoint) {
    sessionStorage[endpoint.key] = endpoint.value
  }
}
