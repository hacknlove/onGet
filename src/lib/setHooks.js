import { setHooks } from './conf'
import { insertHook } from '../private/setHooks'

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
 * @callback BeforeSetHook
 * @param {object} event context in which the hook is executed.
 * @param {string} event.url url of the resource that has received the set
 * @param {*} event.value The current value. It can be changed.
 * @param {boolean} event.preventHooks set this to true to prevent the next hooks to be executed.
 * @param {boolean} event.preventRefresh set this to true to prevent the resource callbacks to be executed.
 * @param {boolean} event.preventSet set this to true to prevent the whole set operation (except the next hooks, that can be prevented with preventHooks)
 * @param {boolean} event.preventPospone set this to true to prevent the next periodical check to be posponed
*/

/**
 * Function to be called after a set operation. They are executed synchrony and they cannot modify the set.
 * @callback afterSetHook
 * @param {object} event context in which the hook is executed
 * @param {string} event.url url of the resource that has received the set
 * @param {*} event.oldValue The previous value
 * @param {*} event.value The current value
 * @param {boolean} event.preventHooks set this to true, to prevent the next hooks to be executed.
 * @param {boolean} event.preventPospone Indicates the next periodical check has been posponed
*/
