import { plugins } from '../lib/conf'

/**
 * Returns the first plugin whose regex matchs the url
 * @private
 * @param {string} url resource's url
 * @return plugin object
 */
export function findPlugin (url) {
  return plugins.find(plugin => url.match(plugin.regex))
}
