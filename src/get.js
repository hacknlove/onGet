import { findPlugin } from './findPlugin'
import { endpoints } from './conf'

/**
 * Returns the cached value for the endpoint
 * @param {string} url url of the endpoint
 * @param {boolean} onlyCached=true, set to false to force the plugin to obtain a value if none if cached
 * @returns {any} whatever value is cached, or undefined, (or the obtained value if onlyCached = false)
 */
export function get (url) {
  const endpoint = endpoints[url]
  if (endpoint) {
    endpoint.clean = undefined
    return endpoints[url].value
  }
  const plugin = findPlugin(url)
  if (!plugin.get) {
    return undefined
  }
  return plugin.get(url)
}
