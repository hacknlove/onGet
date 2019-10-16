import { getResource } from '../private/getResource'
import { addNewSubscription } from '../private/addNewSubscription'
import { refresh } from './refresh'

/**
 * Set a handler to be called each time the value of resource at the url changes
 * @param {string} url The resource to subscribe to
 * @param {handler} cb handler to be called
 * @param {object} options Optional parameters
 * @param {integer} options.interval seconds check for a change on the resorce's value, (if supported by the plugin)
 * @param {any} options.first first value to initiate the resorce with
 * @return {function} unsubscribe function
 */
export function onGet (url, cb, options = {}) {
  const {
    first,
    interval
  } = options
  const resource = getResource(url, first)

  const unsubscribe = addNewSubscription(url, cb, interval)
  resource.clean = undefined

  if (resource.value !== undefined) {
    cb(resource.value)
  }
  if (Date.now() - resource.last > resource.plugin.threshold) {
    refresh(url)
  }
  return unsubscribe
}

/**
 * @callback handler
 * @param {object} resource at the url
*/
