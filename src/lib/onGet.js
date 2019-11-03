import { getResource } from '../private/getResource'
import { addNewSubscription } from '../private/addNewSubscription'
import { refresh } from './refresh'

/**
 * Set a handler to be called each time the value of a resource changes
 * The handler is attached to a resource, (not to a path that could match several resources), and it will be called after the value changes.
 * If the value has changed because of a `set` operation, `context.preventRefresh` could prevent the handler to be executed if it were set to true by any `beforeSet` or `afterSet` handler.
 *
 * @param {string} url The resource to subscribe to
 * @param {handler} cb handler to be called
 * @param {object} [options={}] subscription's options
 * @param {any} options.first first value to initiate the resorce with
 * @param {number} options.interval Some plugins, evaluates periodically the value of the resource. Tha actual amount of milliseconds will be the minimum `options.interval` of every `option.interval`s of every subscriptions on the resource
 * @returns {Function} unsubscribe function
 * @see useOnGet
 * @example
 * import { onGet } from 'onget'
 * onGet('/api/posts', value => {
 *  console.log(value)
 * }, {
 *  interval: 5000
 * })
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
  if (Date.now() - resource.last > resource.plugin.conf.threshold) {
    refresh(url)
  }
  return unsubscribe
}

/**
 * @callback handler
 * @param {any} value The value of the resource
 */
