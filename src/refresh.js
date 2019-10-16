import { resources } from './conf'
import { _set } from './set'
import { pospone } from './pospone'

/**
 * Obtain the current value and is different, update the cache and call the handlers
 * @param {string} url of the resources to be refreshed
 * @param {boolean} force to ignore the threshold and force a refresh no matter how close it is from the previous check
 * @returns {boolean} False if there is nothing to refresh, true otherwise
 */
export async function refresh (url, force = false) {
  const resource = resources[url]
  if (!resource) {
    return false
  }
  resource.clean = undefined
  if (!force && resource.plugin.threshold !== undefined && Date.now() - resource.last < resource.plugin.threshold) {
    return
  }
  pospone(resource)
  resource.plugin.refresh(resource, async value => {
    await _set(resource, value)
  })
  return true
}
