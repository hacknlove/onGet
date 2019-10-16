import { onGet } from './onGet'

/**
 * Attach a handler to change in an resource that will be executed at most once.
 *
 * @param {string} url
 * @param {onceHandler} handler
 * @returns
 */
export function once (url, handler) {
  const unsubscribe = onGet(url, value => {
    unsubscribe()
    handler(value, url)
  })
  return unsubscribe
}

/**
 * @callback onceHandler
 * @param {any} value
 * @param {string} url of the resource whose value has change
 */
