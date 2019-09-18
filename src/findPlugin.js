import { plugins } from './conf'

/**
 * Internal: Returns the first plugin whose regex matchs the url
 * @param {string} url endpoint's url
 * @return plugin object
 */
export function findPlugin (url) {
  return plugins.find(plugin => url.match(plugin.regex))
}
