import { endpoints, plugins } from './conf'

/**
 * Internal
 *
 * @return {object} serializable with the minimun data to restore the endpoints
 */
export function savedEndpoints () {
  const saved = {}
  Object.values(endpoints).forEach(endpoint => {
    const savedEndpoint = {
      value: endpoint.value
    }

    if (endpoint.plugin.saveEndpoint) {
      endpoint.plugin.saveEndpoint(endpoint.url, savedEndpoint)
    }

    if (!savedEndpoint.preventSave) {
      saved[endpoint.url] = savedEndpoint
    }
  })
  return saved
}

/** Internal
 *
 * @return {object} with the minimun data to restore the plugin state
 */
export function savedPlugins () {
  const savedPlugins = {}
  plugins.forEach(plugin => {
    if (!plugin.save) {
      return
    }
    const savedPlugin = plugin.save()
    if (!savedPlugin) {
      return
    }
    savedPlugins[plugin.name] = savedPlugin
  })
  return savedPlugins
}

/**
 * @return {object} an object that represents the current state of the application, and that can be serialized
 */
export function save () {
  return {
    endpoints: savedEndpoints(),
    plugins: savedPlugins()
  }
}
