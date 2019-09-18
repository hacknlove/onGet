import { endpoints } from './conf'
import { createUnsuscribe } from './createUnsuscribe'

/**
 * Adds the callback to the endpoint, updates the min interval configuration, and returns the unsuscribe function
 * @param {string} url endpoint's url
 * @param {function} callback it will be called each time the value of the endpoint changes
 * @param {number} [interval] max interval (miliseconds) to check for a new value
 * @return {function} unsuscribe function
 */
export function addNewSuscription (url, callback, interval) {
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
