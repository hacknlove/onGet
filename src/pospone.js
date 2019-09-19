import { endpoints } from './conf'
import { refresh } from './refresh'
/**
 * Pospone the refresh of the endpoint
 * @param {object} endpoint endpoint whose refresh should be posponed, as returned by getEndpoint(url)
 * @returns undefined
 */
export function pospone (endpoint) {
  if (!endpoint.intervals) {
    return
  }
  clearTimeout(endpoint.timeout)
  if (!endpoints[endpoint.url]) {
    return
  }
  endpoint.timeout = setTimeout(() => {
    refresh(endpoint.url)
  }, endpoint.minInterval)
}
