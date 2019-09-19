import { endpoints } from './conf'
import { set } from './set'
import { pospone } from './pospone'

/**
 * Obtain the current value and is different, update the cache and call the handlers
 * @param {string} url of the endpoints to be refreshed
 */
export function refresh (url) {
  const endpoint = endpoints[url]
  if (!endpoint) {
    return
  }
  endpoint.clean = undefined
  pospone(endpoint)
  endpoint.plugin.refresh(endpoint, value => {
    set(url, value)
  })
}
