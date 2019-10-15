import { endpoints, plugins } from './conf'
import { findPlugin } from './findPlugin'

/**
 * Restore the state of the plugins
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
 * restore the satate of the endpoints
 * @param {savedEndpoints} as returned by saveEndpoints, called by save
 */
export function loadEndpoints (savedEndpoints) {
  Object.keys(savedEndpoints).forEach(url => {
    const plugin = findPlugin(url)
    const endpoint = {
      ...savedEndpoints[url],
      callbacks: {},
      url,
      plugin
    }
    if (plugin.checkInterval) {
      endpoint.intervals = {}
      endpoint.minInterval = Infinity
    }

    if (plugin.threshold !== undefined) {
      endpoint.last = -Infinity
    }
    if (plugin.load) {
      plugin.load(endpoint)
    }
    endpoints[url] = endpoint
  })
}

/**
 * Loads a state
 * @param {object} data is an object representing the state in which the application will be, after loading it.
 */
export function load ({ endpoints, plugins }) {
  loadPlugins(plugins)
  loadEndpoints(endpoints)
}
