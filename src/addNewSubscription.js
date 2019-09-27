import { endpoints } from './conf'
import { createUnsubscribe } from './createUnsubscribe'

/**
 * Adds the callback to the endpoint, updates the min interval configuration, and returns the unsubscribe function
 * @param {string} url endpoint's url
 * @param {function} callback it will be called each time the value of the endpoint changes
 * @param {number} [interval] max interval (milliseconds) to check for a new value
 * @return {function} unsubscribe function
 */
export function addNewSubscription (url, callback, interval) {
  const endpoint = endpoints[url]

  var sk
  do {
    sk = Math.random().toString(36).substr(2) + (Date.now() % 1000).toString(36)
  } while (endpoint.callbacks[sk])
  endpoint.callbacks[sk] = callback

  if (endpoint.intervals) {
    interval = interval || endpoint.plugin.checkInterval
    endpoint.intervals[sk] = interval
    endpoint.minInterval = Math.min(endpoint.minInterval, interval)
  }

  return createUnsubscribe(endpoint, sk)
}
