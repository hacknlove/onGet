import { endpoints } from './conf'
import { set } from './set'
import { pospone } from './pospone'

/**
 * Obtain the current value and is different, update the cache and call the handlers
 * @param {string} url of the endpoints to be refreshed
 * @param {boolean} force to ignore the threshold and force a refresh no matter how close it is from the previous check
 * @returns {boolean} False if there is nothing to refresh, true otherwise
 */
export async function refresh (url, force = false) {
  const endpoint = endpoints[url]
  if (!endpoint) {
    return false
  }
  endpoint.clean = undefined
  if (!force && endpoint.plugin.threshold !== undefined && Date.now() - endpoint.last < endpoint.plugin.threshold) {
    return
  }
  pospone(endpoint)
  endpoint.plugin.refresh(endpoint, async value => {
    await set(url, value)
  })
  return true
}

/**
 * call refresh on every endpoint that matches the regular expression
 * @param {RegExp} regex to test the endpoints
 * @param {boolean} force to pass to refresh
 */
export function refreshRegExp (regex, force) {
  Object.values(endpoints).forEach(endpoint => {
    if (refreshRegExp.test(endpoint.url)) {
      refresh(endpoint.url, force)
    }
  })
}
