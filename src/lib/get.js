import { findPlugin } from '../private/findPlugin'
import { resources } from './conf'

/**
 * @summary Returns the value of a resource
 *
 * @description If the resource has not been used yet, so it has no value cached, the plugin that deals with its url could evaluate the value. This is only possible when the evaluation is synchronous and the plugins has the `get` method defined.
 *
 * @param {string} url url of the resource
 * @returns {any} the cached value is exists, or an evaluated value if plugin.get exists
 * @example
 * import { get } from 'onget'
 * set('sessionStorage://foo', 42)
 * get('sessionStorage://foo') // 42
 * get('localStorage://foo') // undefined
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
