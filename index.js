import isDifferent from 'isdifferent'
import { findPlugin, registerPlugin } from './plugins'
import { endpoints, getEndpoint, addNewSuscription } from './lib'

function onGet (url, cb, interval, first) {
  const endpoint = getEndpoint(url, first)
  const unsuscribe = addNewSuscription(url, cb, interval)
  endpoint.clean = undefined

  if (endpoints.value !== undefined) {
    cb(endpoint.value)
  }
  if (Date.now() - endpoint.last > endpoint.threshold) {
    refresh(url)
  }
  return unsuscribe
}

function set (url, value, pospone) {
  var notNew = endpoints.hasOwnProperty(url)

  const endpoint = getEndpoint(url, value)
  endpoint.clean = undefined

  if (endpoint.intervals) {
    endpoint.last = Date.now()
    if (pospone) {
      pospone(endpoint)
    }
  }

  if (isDifferent(value, endpoint.value)) {
    endpoint.value = value
    Object.values(endpoint.callbacks).forEach(cb => cb(endpoint.value))
  }
}

function pospone (endpoint) {
  if (!endpoint.intervals) {
    return
  }
  clearTimeout(endpoint.timeout)
  if (!endpoints[endpoint.url]) {
    return
  }
  endpoint.timeout = setTimeout(() => {
    refresh(endpoint.url)
  }, endpoint.minInterval)
}

function refresh (url) {
  const endpoint = endpoints[url]
  if (!endpoint) {
    return
  }
  endpoint.clean = undefined
  pospone(endpoint)
  endpoint.plugin.refresh(endpoint, value => {
    set(url, value)
  })
}

function get (url) {
  const endpoint = endpoints[url]
  if (endpoint) {
    endpoint.clean = undefined
    return endpoints[url].value
  }
  const plugin = findPlugin(url)
  if (!plugin.get) {
    return
  }
  return plugin.get(url)
}

export {
  onGet, set, refresh, get, registerPlugin
}
