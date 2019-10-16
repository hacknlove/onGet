import { isDifferent } from 'isdifferent'
import { resources, setHooks } from './conf'
import { getResource } from '../private/getResource'
import { pospone } from '../private/pospone'
import pathToRegExp from 'path-to-regexp'

/**
 * Internal set, that does not call events
 * @param {object} resource to be updated
 * @param {*} value to update the resource with
 * @param {boolean} preventRefresh to avoid calling the resource callbacks
 */
export function _set (resource, value, preventRefresh) {
  if (!isDifferent(value, resource.value)) {
    return
  }
  const oldValue = resource.value
  resource.value = value
  if (resource.plugin.set) {
    resource.plugin.set(resource, oldValue, preventRefresh)
  }
  if (!preventRefresh) {
    Object.values(resource.callbacks).forEach(cb => cb(resource.value))
  }
}

/**
 * Internal. Execute all the hooks that match an url
 * @param {array} where array to search for the hook
 * @param {object} event object to be passed to the hook
 * @return {object} the event object, it might be modified by the hooks
 */
export function executeHooks (where, event) {
  for (let i = 0, z = where.length; i < z; i++) {
    if (event.preventHooks) {
      break
    }
    const [regex, keys, cb] = where[i]
    const match = event.url.match(regex)
    if (!match) {
      continue
    }
    event.params = {}
    for (let i = 1; i < match.length; i++) {
      event.params[keys[i - 1].name] = match[1]
    }

    cb(event)
  }

  return event
}

/**
 * Internal. Prepares the regex that match the path patters, and insert the hook in the indicated array
 * @param {string} path the same format of express. (path-to-regexp)
 * @param {(afterSetHook|BeforeSetHook)} hook Function to be called at hook time
 * @param {array} where array to insert the hook in
*/
export function insertHook (path, hook, where) {
  const keys = []
  const regex = pathToRegExp(path, keys)
  where.push([regex, keys, hook])
}

/**
 * set a new cached value for an resource, and call the handlers. If the resource does not exists, it creates it.
 * @param {string} url  of the resource whose value set to
 * @param {any} value value to series
 * @param {object} options to determine the behaviour of the set, and to be passed to the hooks
 * @param {boolean} options.preventPospone if true, it prevents to pospone the next check
 * @param {boolean} event.preventHooks if true, prevent the hooks to be executed.
 * @param {boolean} event.preventRefresh if true, prevents the resource callbacks to be executed.
 * @param {boolean} event.preventSet if true to prevent the whole set operation, except the beforeSetHooks
 */
export function set (url, value, options = {}) {
  const beforeResult = executeHooks(setHooks.before, {
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
    return executeHooks(setHooks.after, {
      ...options,
      url,
      value
    })
  }

  const oldValue = resource.value

  resource.clean = undefined
  if (resource.intervals && !options.preventPospone) {
    pospone(resource)
  }
  _set(resource, value, beforeResult.preventRefresh)
  return executeHooks(setHooks.after, {
    ...options,
    url,
    oldValue,
    value
  })
}

/**
 * Insert a hook to be executed before doing the set. They can prevent the set, modify the value to be set, prevent to be set
 * @param {string} path Pattern to check in which resources execute the hook
 * @param {BeforeSetHook} hook Function to be called
 */
export function beforeSet (path, hook) {
  insertHook(path, hook, setHooks.before)
}

/**
 * Insert a hook to be executed after doing the set. They  modify the value to be set
 * @param {string} path Pattern to check in which resources execute the hook
 * @param {afterSetHook} hook Function to be called
 */
export function afterSet (path, hook) {
  insertHook(path, hook, setHooks.after)
}

/**
 * Function to be called before a set operation. They are executed synchrony and they can modify, even prevent, the set.
 * @function BeforeSetHook
 * @param {object} event context in which the hook is executed
 * @param {string} event.url url of the resource that has received the set
 * @param {*} event.value The current value. It can be changed.
 * @param {boolean} event.preventHooks set this to true to prevent the next hooks to be executed.
 * @param {boolean} event.preventRefresh set this to true to prevent the resource callbacks to be executed.
 * @param {boolean} event.preventSet set this to true to prevent the whole set operation (except the next hooks, that can be prevented with preventHooks)
 * @param {boolean} event.preventPospone set this to true to prevent the next periodical check to be posponed
*/

/**
 * Function to be called after a set operation. They are executed synchrony and they cannot modify the set.
 * @function afterSetHook
 * @param {object} event context in which the hook is executed
 * @param {string} event.url url of the resource that has received the set
 * @param {*} event.oldValue The previous value
 * @param {*} event.value The current value
 * @param {boolean} event.preventHooks set this to true, to prevent the next hooks to be executed.
 * @param {boolean} event.preventPospone Indicates the next periodical check has been posponed
*/
