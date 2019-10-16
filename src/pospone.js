import { resources } from './conf'
import { refresh } from './refresh'
/**
 * Pospone the refresh of the resource
 * @private
 * @param {object} resource resource whose refresh should be posponed, as returned by getResource(url)
 * @returns undefined
 */
export function pospone (resource) {
  if (!resource.intervals) {
    return
  }
  clearTimeout(resource.timeout)
  if (!resources[resource.url]) {
    return
  }
  resource.last = Date.now()
  resource.timeout = setTimeout(() => {
    refresh(resource.url)
  }, resource.minInterval)
}
