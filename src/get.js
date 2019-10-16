import { findPlugin } from './findPlugin'
import { resources } from './conf'

/**
 * Returns the cached value for the resource
 * @param {string} url url of the resource
 * @param {boolean} onlyCached=true, set to false to force the plugin to obtain a value if none if cached
 * @returns {any} the cached value is exists, or an evaluated value if plugin.get exists
 */
export function get (url) {
  const resource = resources[url]
  if (resource) {
    resource.clean = undefined
    return resources[url].value
  }
  const plugin = findPlugin(url)
  if (!plugin.get) {
    return undefined
  }
  return plugin.get(url)
}
