import { resources, setHooks, debouncedSets } from './conf'
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
 * @param {boolean} options.preventHooks if true, prevent the hooks to be executed.
 * @param {boolean} options.preventRefresh if true, prevents the resource callbacks to be executed.
 * @param {boolean} options.preventSet if true to prevent the whole set operation, except the beforeSetHooks
 * @param {number} options.debounce amount of milliseconds to debounce consecutive sets to a resource. (beforeSetHooks are also debounced)
 */
export function set (url, value, options = {}) {
  if (debouncedSets[url]) {
    clearTimeout(debouncedSets[url])
    delete debouncedSets[url]
  }
  if (options.debounce) {
    let debounce = options.debounce
    delete options.debounce
    debouncedSets[url] = setTimeout(set, debounce, url, value, options)
    return
  }

  const beforeResult = executeHooks(setHooks.beforeSet, {
    ...options,
    url,
    value
  })

  if (beforeResult.preventSet) {
    return
  }
  value = beforeResult.value
  options.preventPospone = beforeResult.preventPospone

  const resource = resources[url]
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
