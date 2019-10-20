import { resources, plugins } from '../lib/conf'

/**
 * @private
 * @return {object} serializable with the minimun data to restore the resources.
 */
export function savedResources () {
  const saved = {}
  Object.values(resources).forEach(resource => {
    const savedResource = {
      value: resource.value
    }

    if (resource.plugin.saveResource) {
      resource.plugin.saveResource(resource.url, savedResource)
    }

    if (!savedResource.preventSave) {
      saved[resource.url] = savedResource
    }
  })
  return saved
}

/**
 * @private
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
