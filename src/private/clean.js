import { conf, resources } from '../lib/conf'

/**
 * Cleans unused resources. The ones that has no callbacks, no method called recently.
 * It is  intended to be called each time a new resource is created
 * @private
 */
export function clean () {
  const values = Object.values(resources)

  if (values.length < conf.CACHE_SIZE) {
    return
  }

  values.forEach(resource => {
    if (!resource.clean) {
      if (Object.keys(resource.callbacks).length === 0) {
        resource.clean = true
      }
      return
    }
    if (resource.plugin.clean && resource.plugin.clean(resource)) {
      return
    }
    clearTimeout(resources[resource.url].timeout)
    delete resources[resource.url]
  })
}
