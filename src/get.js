import { findPlugin } from './findPlugin'
import { endpoints } from './conf'

export function get (url) {
  const endpoint = endpoints[url]
  if (endpoint) {
    endpoint.clean = undefined
    return endpoints[url].value
  }
  const plugin = findPlugin(url)
  if (!plugin.get) {
    return
  }
  return plugin.get(url)
}
