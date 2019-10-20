import { onGet } from './onGet'

/**
 * Attach a handler, that will be executed at most once, to the eventual change the the value of resource.
 * The handler is attached to a resource, not to a path that could match several resources, and it will be called after the value changes.
 *
 * If the value has changed because of a `set` operation, `context.preventRefresh` could prevent the handler to be executed if it were set to true by any `beforeSet` or `afterSet` handler.
 *
 * @param {string} url The url of a single resource.
 * @param {onceHandler} handler function that will be executed the first time the resource's value changes
 * @returns {Function} a detach function that could be called to detach the handler
 * @see waitUntil
 * @see onGet
 * @see useOnGet
 * @example
 * import { once, set } from 'onget'
 *
 * once('dotted://hello', value => alert(`hello ${value}`))
 * set('dotted://hello', 'world') // handler will be executed
 * set('dotted://hello', 'cow') // handler will not be executed
 */
export function once (url, handler) {
  const detach = onGet(url, value => {
    detach()
    handler(value, url)
  })
  return detach
}

/**
 * @callback onceHandler
 * @param {any} value
 * @param {string} url of the resource whose value has change
 */
