import { endpoints, plugins } from './conf'
import { savedEndpoints } from './save'
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
 * @param {savedEnpoints} as returned by saveEndpoints, called by save
 */
export function loadEndpoints (savedEnpoints) {
  Object.keys(savedEndpoints).forEach(url => {
    const loadedEndpoint = {
      ...savedEnpoints[url],
      url
    }
    loadedEndpoint.plugin = findPlugin(loadedEndpoint.url)
    if (loadedEndpoint.plugin.load) {
      loadedEndpoint.plugin.load(loadedEndpoint)
    }
    endpoints[url] = loadedEndpoint
  })
}

/**
 * Loads a state
 * @param {object} data is an object representing the state in which the application will be, after loading it.
 */
export function load ({ savedEndpoints, savedPlugins }) {
  loadPlugins(savedPlugins)
  loadEndpoints(savedEndpoints)
}
