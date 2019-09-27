import { getEndpoint } from './getEndpoint'
import { addNewSubscription } from './addNewSubscription'
import { refresh } from './refresh'

/**
 * Set a handler to be called each time the value of the url changes
 * @param {string} url The value to subscribe to
 * @param {function} cb handler to be called
 * @param {object} options Optional parameters
 * @param {integer} options.interval seconds to refresh the value
 * @param {any} options.first first value to pass to the plugin
 */
export function onGet (url, cb, options = {}) {
  const {
    first,
    interval
  } = options
  const endpoint = getEndpoint(url, first)

  const unsubscribe = addNewSubscription(url, cb, interval)
  endpoint.clean = undefined

  if (endpoint.value !== undefined) {
    cb(endpoint.value)
  }
  if (Date.now() - endpoint.last > endpoint.plugin.threshold) {
    refresh(url)
  }
  return unsubscribe
}
