import isDifferent from 'isdifferent'
import { endpoints } from './conf'
import { getEndpoint } from './getEndpoint'
import { pospone } from './pospone'
/**
 * set a new cached value for an endpoint, and call the handlers. If the endpoint does not exists, it creates it.
 * @param {string} url  of the endpoint whose value set to
 * @param {any} value value to series
 * @param {boolean} doPospone=true if false do not pospone the closest refresh
 * @return {object} endpoint
 */

export function set (url, value, doPospone) {
  const endpoint = endpoints[url]

  if (!endpoint) {
    const endpoint = getEndpoint(url, value)
    if (endpoint.plugin.set) {
      endpoint.value = value
      endpoint.plugin.set(endpoint)
    }
    return
  }

  endpoint.clean = undefined
  if (endpoint.intervals) {
    endpoint.last = Date.now()
    if (doPospone) {
      pospone(endpoint)
    }
  }
  if (!isDifferent(value, endpoint.value)) {
    return
  }

  endpoint.value = value
  if (endpoint.plugin.set) {
    endpoint.plugin.set(endpoint)
  }
  Object.values(endpoint.callbacks).forEach(cb => setTimeout(cb, 0, endpoint.value))

  return endpoint
}
