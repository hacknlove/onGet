import { getEndpoint } from './getEndpoint'
import { addNewSubscription } from './addNewSubscription'
import { refresh } from './refresh'

/**
 * Set a handler to be called each time the value of the url changes
 * @param {string} url The value to subscribe to
 * @param {function} cb handler to be called
 * @param {integer} interval seconds to refresh the value
 * @param {any} first first value to pass to the plugin
 */
export function onGet (url, cb, interval, first) {
  const endpoint = getEndpoint(url, first)
  const unsubscribe = addNewSubscription(url, cb, interval)
  endpoint.clean = undefined

  if (endpoint.value !== undefined) {
    cb(endpoint.value)
  }
  if (Date.now() - endpoint.last > endpoint.threshold) {
    refresh(url)
  }
  return unsubscribe
}
