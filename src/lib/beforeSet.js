import { setHooks } from './conf'
import { insertHook } from '../private/setHooks'

/**
 * Attach a handler for an express-like path, that will be executed before any set operation on the resources whose url match that path.
 * From inside the handler it is possible to modify the value to be set, prevent the next beforeSet and afterSet handlers to be executed, prevent the subscription callbacks to be executed, or prevent the whole to be set to take place.
 *
 * @param {string} path express-like path to check in which resources execute the hook
 * @param {BeforeSetHandler} hook Function to be called
 * @see set
 * @see afterSet
 * @example
 *  import { beforeSet, set } from 'onget'
 *
 *  beforeSet(`localStorage://username`, context => {
 *    context.value = context.value.trim().toLowerCase()
 *  })
 *
 *  beforeSet(`localStorage://email`, context => {
 *    if (context.value.match(/@/) === null) {
 *      context.preventSet = true
 *      set('dotted://errors.email', true)
 *    }
 *  })
 */
export function beforeSet (path, hook) {
  insertHook(path, hook, setHooks.beforeSet)
}

/**
 * Function to be called before a set operation. They are executed synchrony and they can modify, even prevent, the set.
 *
 * @callback BeforeSetHandler
 * @param {object} event context in which the hook is executed.
 * @param {string} event.url url of the resource that has received the set
 * @param {string} context.path path part of the url
 * @param {string} context.search search part of the url
 * @param {string} context.hash hash part of the url
 * @param {object} event.params the params captured on the url by the path. Like in express
 * @param {*} event.value The current value. It can be changed.
 * @param {boolean} event.preventHooks set this to true to prevent the next hooks to be executed.
 * @param {boolean} event.preventRefresh set this to true to prevent the resource callbacks to be executed.
 * @param {boolean} event.preventSet set this to true to prevent the whole set operation (except the next hooks, that can be prevented with preventHooks)
 * @param {boolean} event.preventPospone set this to true to prevent the next periodical check to be posponed
 * @see beforeSet
 */
