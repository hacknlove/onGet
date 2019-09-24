/* global localStorage */
const PROTOCOLCUT = 'localStorage://'.length

export default {
  name: 'localStorage',
  regex: /^localStorage:\/\/./i,
  checkInterval: 30,
  threshold: 500,
  refresh (endpoint, eventHandler) {
    eventHandler(localStorage[endpoint.key])
  },
  getEndpoint (endpoint) {
    endpoint.key = endpoint.url.substr(PROTOCOLCUT)

    if (localStorage[endpoint.key] !== undefined) {
      endpoint.value = localStorage[endpoint.key]
      return
    }
    localStorage[endpoint.key] = endpoint.value
  },
  get (url) {
    return localStorage[url.substr(PROTOCOLCUT)]
  },
  set (endpoint) {
    localStorage[endpoint.key] = endpoint.value
  }
}
