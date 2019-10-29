import { resources, setHooks } from './conf'
import { getResource } from '../private/getResource'
import { pospone } from '../private/pospone'
import { _set } from '../private/set'
import { executeHooks } from '../private/setHooks'

/**
 * set a new cached value for an resource, and call the handlers. If the resource does not exists, it creates it.
 *
 * @param {string} url  of the resource whose value set to.
 * @param {any} value value to series.
 * @param {object} options to determine the behaviour of the set, and to be passed to the hooks.
 * @param {boolean} options.preventPospone if true, it prevents to pospone the next check.
 * @param {boolean} event.preventHooks if true, prevent the hooks to be executed.
 * @param {boolean} event.preventRefresh if true, prevents the resource callbacks to be executed.
 * @param {boolean} event.preventSet if true to prevent the whole set operation, except the beforeSetHooks
 */
export function set (url, value, options = {}) {
  const beforeResult = executeHooks(setHooks.beforeSet, {
    ...options,
    url,
    value
  })
  if (beforeResult.preventSet) {
    return
  }
  const resource = resources[url]
  value = beforeResult.value
  options.preventPospone = beforeResult.preventPospone

  if (!resource) {
    const resource = getResource(url, value)
    if (resource.plugin.set) {
      resource.value = value
      resource.plugin.set(resource)
    }
    executeHooks(setHooks.afterSet, {
      ...options,
      url,
      value
    })
    return
  }

  const oldValue = resource.value

  resource.clean = undefined
  if (resource.intervals && !options.preventPospone) {
    pospone(resource)
  }
  _set(resource, value, beforeResult.preventRefresh)
  executeHooks(setHooks.afterSet, {
    ...options,
    url,
    oldValue,
    value
  })
}
