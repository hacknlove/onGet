import { useState, useEffect } from 'react'
import { onGet } from './onGet'
import { get } from './get'

/**
 * React hook that reload the component when the resource's value change
 *
 * @param {string} url the url to subscribe to
 * @param {object} options options
 * @param {any} options.first The first value to be used. Useful with asynchronous resources, when there is no value cached yet.
 * @param {boolean} options.firstIfUrlChanges When the url changes, the first value returned for the new url will be the last value of the last url, unless `options.firstIfUrlChanges` be truthy
 * @returns the current value
 */
export function useOnGet (url, options = {}) {
  let [value, set] = useState(() => get(url) || options.first)

  if (options.firstIfUrlChanges) {
    value = get(url) || options.first
  }

  useEffect(() => {
    return onGet(url, set, options)
  }, [url])

  return value
}
