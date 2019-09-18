import { endpoints } from './conf'
import { set } from './set'
import { pospone } from './pospone'

export default function refresh (url) {
  const endpoint = endpoints[url]
  if (!endpoint) {
    return
  }
  endpoint.clean = undefined
  pospone(endpoint)
  endpoint.plugin.refresh(endpoint, value => {
    set(url, value)
  })
}
