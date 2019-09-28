import { onGet } from './onGet'
import { get } from './get'

const { useState, useEffect } = require('react')

/**
 * React hook that reload the component when the url's state change
 * @param {*} url the url to subscribe to
 * @param {*} first the first value to use, before the real one arrives
 */
export function useOnGet (url, options) {
  const [value, set] = useState(() => get(url) || options.first)

  useEffect(() => {
    return onGet(url, set, options)
  }, [url])

  return value
}
