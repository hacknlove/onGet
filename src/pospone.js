import { endpoints } from './conf'
import { refresh } from './refresh'

export default function pospone (endpoint) {
  if (!endpoint.intervals) {
    return
  }
  clearTimeout(endpoint.timeout)
  if (!endpoints[endpoint.url]) {
    return
  }
  endpoint.timeout = setTimeout(() => {
    refresh(endpoint.url)
  }, endpoint.minInterval)
}
