import { resources, plugins } from '../lib/conf'
import { findPlugin } from './findPlugin'

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
 *
 * @private
 * @param {savedResources} as returned by saveResources, called by save
 */
export function loadResources (savedResources) {
  Object.keys(savedResources).forEach(url => {
    const plugin = findPlugin(url)
    const resource = {
      ...savedResources[url],
      callbacks: {},
      url,
      plugin
    }
    if (plugin.conf.checkInterval) {
      resource.intervals = {}
      resource.minInterval = Infinity
    }

    if (plugin.conf.threshold !== undefined) {
      resource.last = -Infinity
    }
    if (plugin.loadResource) {
      plugin.loadResource(resource)
    }
    resources[url] = resource
  })
}
