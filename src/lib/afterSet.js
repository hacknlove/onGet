import { setHooks } from './conf'
import { insertHook } from '../private/setHooks'

/**
 * Attach a handler for an express-like path, that will be executed after any set operation the the resources whose url match that path.
 * From inside the handler it is possible to prevent the next afterSet handlers to be executed.
 * @param {string} path Pattern to check in which resources execute the hook
 * @param {afterSetHandler} hook Function to be called
 * @see set
 * @see beforeSet
 */
export function afterSet (path, hook) {
  insertHook(path, hook, setHooks.afterSet)
}

/**
 * Function to be called after a set operation. They are executed synchrony and they cannot modify the set.
 *
 * @callback afterSetHandler
 * @param {object} event context in which the hook is executed
 * @param {string} event.url url of the resource that has received the set
 * @param {object} event.params the params captured on the url by the path. Like in express
 * @param {any} event.oldValue The previous value
 * @param {any} event.value The current value
 * @param {boolean} event.preventHooks set this to true, to prevent the next hooks to be executed.
 * @param {boolean} event.preventPospone Indicates the next periodical check has been posponed
 * @see afterSet
 */
