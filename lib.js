import { findPlugin } from './plugins'

const endpoints = {}

/**
 * Creates if needed and returns the object that stores the callbacks, configuration and state of an endpoint
 * @param {string} url endpoint's url
 * @params {any} [firstValue] is used as a firstValue, before any action was performed by the plugin
 * @returns {object} the endpoint
 */
function getEndpoint (url, firstValue) {
  if (endpoints[url]) {
    return endpoints[url]
  }

  const plugin = findPlugin(url)
  if (!plugin) {
    throw new Error(`No plugin for ${url}`)
  }
  const endpoint = {
    url,
    plugin,
    value: firstValue,
    callbacks: {}
  }

  if (plugin.checkInterval) {
    endpoint.intervals = {}
    endpoint.minInterval = Infinity
  }

  if (plugin.threshold) {
    endpoint.last = 1
  }

  if (plugin.getEndpoint) {
    plugin.getEndpoint(endpoint)
  }

  endpoints[url] = endpoint

  return endpoints[url]
}

/**
 * Adds the callback to the endpoint, updates the min interval configuration, and returns the unsuscribe function
 * @param {string} url endpoint's url
 * @param {function} callback it will be called each time the value of the endpoint changes
 * @param {number} [interval] max interval (miliseconds) to check for a new value
 * @return {function} unsuscribe function
 */
function addNewSuscription (url, callback, interval) {
  const endpoint = endpoints[url]

  var sk
  do {
    sk = Math.random().toString(36).substr(2) + (Date.now() % 1000).toString(36)
  } while (endpoint.callbacks[sk])
  endpoint.callbacks[sk] = callback

  if (endpoint.intervals) {
    interval = interval === undefined ? endpoint.plugin.checkInterval : interval
    endpoint.intervals[sk] = interval || Infinity
    endpoint.minInterval = Math.min(endpoint.minInterval, interval)
  }

  return createUnsuscribe(endpoint, sk)
}

/**
 * Function factory that creats and returns unsuscribe functions
 * @param {object} endpoint from which unsuscribe
 * @param {strink} sk key that identifies the suscription
 */
function createUnsuscribe (endpoint, sk) {
  return () => {
    if (!endpoint.callbacks.hasOwnProperty(sk)) {
      return
    }

    if (endpoint.plugin.unsuscribe) {
      endpoint.plugin.unsuscribe(endpoint)
    }

    delete endpoint.callbacks[sk]
    if (endpoint.intervals) {
      delete endpoint.intervals[sk]
      endpoint.minInterval = Math.min(...Object.values(endpoint.intervals))
    }
  }
}

export {
  getEndpoint, addNewSuscription, createUnsuscribe, endpoints
}
