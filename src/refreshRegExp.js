import { endpoints } from './conf'
import { refresh } from './refresh'
/**
 * call refresh on every endpoint that matches the regular expression
 * @param {RegExp} regex to test the endpoints
 * @param {boolean} force to pass to refresh
 */
export function refreshRegExp (regex, force) {
  Object.values(endpoints).forEach(endpoint => {
    if (regex.test(endpoint.url)) {
      refresh(endpoint.url, force)
    }
  })
}
