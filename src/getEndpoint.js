import { findPlugin } from './findPlugin'
import { endpoints } from './conf'
import { clean } from './clean'

/**
 * Creates if needed and returns the object that stores the callbacks, configuration and state of an endpoint
 * @param {string} url endpoint's url
 * @params {any} [firstValue] is used as a firstValue, before any action was performed by the plugin
 * @returns {object} the endpoint
 */
export function getEndpoint (url, firstValue) {
  if (endpoints[url]) {
    return endpoints[url]
  }
  setTimeout(clean)
  const plugin = findPlugin(url)
  if (!plugin) {
    throw new Error(`No plugin for ${url}`)
  }
  const endpoint = {
    url,
    plugin,
    value: firstValue,
    callbacks: {}
  }

  if (plugin.checkInterval) {
    endpoint.intervals = {}
    endpoint.minInterval = Infinity
  }

  if (plugin.threshold) {
    endpoint.last = 1
  }

  if (plugin.getEndpoint) {
    plugin.getEndpoint(endpoint)
  }

  endpoints[url] = endpoint
  return endpoints[url]
}
