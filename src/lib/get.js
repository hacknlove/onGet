import { findPlugin } from '../private/findPlugin'
import { resources } from './conf'

/**
 * Returns the cached value for the resource
 *
 * @param {string} url url of the resource
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
