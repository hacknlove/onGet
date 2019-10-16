import { resources, plugins } from './conf'

/**
 * Internal
 *
 * @return {object} serializable with the minimun data to restore the resources
 */
export function savedresources () {
  const saved = {}
  Object.values(resources).forEach(resource => {
    const savedresource = {
      value: resource.value
    }

    if (resource.plugin.saveresource) {
      resource.plugin.saveresource(resource.url, savedresource)
    }

    if (!savedresource.preventSave) {
      saved[resource.url] = savedresource
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
    resources: savedresources(),
    plugins: savedPlugins()
  }
}
