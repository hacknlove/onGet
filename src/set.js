import isDifferent from 'isdifferent'
import { endpoints } from './conf'
import { getEndpoint } from './getEndpoint'
import { pospone } from './pospone'
/**
 * set a new value for an endpoint, and call the handlers. If the endpoint does not exists, it creates it.
 * @param {string} url  of the endpoint whose value set to
 * @param {any} value value to series
 * @param {boolean} doPospone=true if false do not pospone the closest refresh
 * @return {object} endpoint
 */
export function set (url, value, doPospone) {
  var isNew = !endpoints.hasOwnProperty(url)

  const endpoint = getEndpoint(url, value)

  if (isNew) {
    return endpoint
  }

  endpoint.clean = undefined
  if (endpoint.intervals) {
    endpoint.last = Date.now()
    if (doPospone) {
      pospone(endpoint)
    }
  }

  if (isDifferent(value, endpoint.value)) {
    endpoint.value = value
    Object.values(endpoint.callbacks).forEach(cb => cb(endpoint.value))
  }

  return endpoint
}
