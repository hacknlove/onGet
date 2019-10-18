import { resources } from './conf'
import { refresh } from './refresh'
/**
 * @summary Refresh every resource that matches the regular expression.
 *
 * @param {RegExp} regex to test against the resources' urls
 * @param {boolean} force to pass to refresh
 * @example
 * import { refreshRegExp } from 'onget'
 * document.getElementById('reload').addEventListener('click', () => {
 *    refreshRegExp(/^\/api\//)
 * })
 */
export function refreshRegExp (regex, force) {
  Object.values(resources).forEach(resource => {
    if (regex.test(resource.url)) {
      refresh(resource.url, force)
    }
  })
}
