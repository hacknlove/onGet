import { conf, endpoints } from './conf'

/**
 * Cleans unused endpoints. The ones that has no callbacks, no method called recently.
 * It is  intended to be called each time a new endpoint is created
 */
export function clean () {
  const values = Object.values(endpoints)

  if (values.length < conf.CACHE_SIZE) {
    return
  }

  values.forEach(endpoint => {
    if (!endpoint.clean) {
      if (Object.keys(endpoint.callbacks).length === 0) {
        endpoint.clean = true
      }
      return
    }
    if (endpoint.plugin.clean && endpoint.plugin.clean(endpoint)) {
      return
    }
    clearTimeout(endpoints[endpoint.url].timeout)
    delete endpoints[endpoint.url]
  })
}
