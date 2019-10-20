import { findPlugin } from './findPlugin'
import { resources } from '../lib/conf'
import { clean } from './clean'

/**
 * Creates if needed and returns the object that stores the callbacks, configuration and state of an resource
 * @private
 * @param {string} url resource's url
 * @param {any} [firstValue] is used as a firstValue, before any action was performed by the plugin
 * @returns {object} the resource
 */
export function getResource (url, firstValue) {
  if (resources[url]) {
    return resources[url]
  }
  setTimeout(clean)
  const plugin = findPlugin(url)
  if (!plugin) {
    throw new Error(`No plugin for ${url}`)
  }
  const resource = {
    url,
    plugin,
    value: firstValue,
    callbacks: {}
  }
  resources[url] = resource

  if (plugin.conf.checkInterval) {
    resource.intervals = {}
    resource.minInterval = Infinity
  }

  if (plugin.conf.threshold !== undefined) {
    resource.last = -Infinity
  }

  if (plugin.getResource) {
    plugin.getResource(resource)
  }

  return resource
}
