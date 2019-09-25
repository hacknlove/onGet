import { endpoints } from './conf'
import { set } from './set'
import { pospone } from './pospone'

/**
 * Obtain the current value and is different, update the cache and call the handlers
 * @param {string} url of the endpoints to be refreshed
 * @returns {boolean} False if there is nothing to refresh, true otherwise
 */
export function refresh (url) {
  const endpoint = endpoints[url]
  if (!endpoint) {
    return false
  }
  endpoint.clean = undefined
  if (endpoint.plugin.threshold !== undefined && Date.now() - endpoint.last < endpoint.plugin.threshold) {
    return
  }
  pospone(endpoint)
  endpoint.plugin.refresh(endpoint, value => {
    set(url, value)
  })
  return true
}
