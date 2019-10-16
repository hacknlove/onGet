import { resources } from './conf'
import { refresh } from './refresh'
/**
 * call refresh on every resource that matches the regular expression
 * @param {RegExp} regex to test the resources
 * @param {boolean} force to pass to refresh
 */
export function refreshRegExp (regex, force) {
  Object.values(resources).forEach(resource => {
    if (regex.test(resource.url)) {
      refresh(resource.url, force)
    }
  })
}
