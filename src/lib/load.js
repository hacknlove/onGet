import { resources, plugins } from './conf'
import { findPlugin } from '../private/findPlugin'

/**
 * Restore the state of the plugins
 * @private
 * @param {object} savedPlugins as returned by savePlugins, called by save
 */
export function loadPlugins (savedPlugins) {
  plugins.forEach(plugin => {
    if (!plugin.load || !savedPlugins[plugin.name]) {
      return
    }
    plugin.load(savedPlugins[plugin.name])
  })
}

/**
 * restore the satate of the resources
 * @private
 * @param {savedresources} as returned by saveresources, called by save
 */
export function loadresources (savedresources) {
  Object.keys(savedresources).forEach(url => {
    const plugin = findPlugin(url)
    const resource = {
      ...savedresources[url],
      callbacks: {},
      url,
      plugin
    }
    if (plugin.checkInterval) {
      resource.intervals = {}
      resource.minInterval = Infinity
    }

    if (plugin.threshold !== undefined) {
      resource.last = -Infinity
    }
    if (plugin.load) {
      plugin.load(resource)
    }
    resources[url] = resource
  })
}

/**
 * Loads a state
 * @param {object} data is an object representing the state in which the application will be, after loading it.
 */
export function load ({ resources, plugins }) {
  loadPlugins(plugins)
  loadresources(resources)
}
