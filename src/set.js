import isDifferent from 'isdifferent'
import { endpoints } from './conf'
import { getEndpoint } from './getEndpoint'

export function set (url, value, pospone) {
  var notNew = endpoints.hasOwnProperty(url)

  const endpoint = getEndpoint(url, value)
  endpoint.clean = undefined

  if (endpoint.intervals) {
    endpoint.last = Date.now()
    if (pospone) {
      pospone(endpoint)
    }
  }

  if (isDifferent(value, endpoint.value)) {
    endpoint.value = value
    Object.values(endpoint.callbacks).forEach(cb => cb(endpoint.value))
  }
}
