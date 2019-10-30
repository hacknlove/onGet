import { setHooks } from './conf'
import { insertHook } from '../private/setHooks'

/**
 * Attach a handler for an express-like path, that will be executed before any refresh operation on the resources whose url match that path.
 * From inside the handler it is possible to add more parameters to the call to plugin.
 *
 * @param {string} path express-like path to check in which resources execute the hook
 * @param {BeforeRefreshHandler} hook Function to be called
 * @see refresh
 * @example
 *  import { beforeRefresh, refresh } from 'onget'
 *
 *  beforerefresh('/api/user/current', context => {
 *    const token = get('localStorage://token')
 *    context.options = {
 *      headers: { 'Authorization': `Bearer ${token}` }
 *    }
 *  })
 *
 *  refresh('/api/user/current')
 */
export function beforeRefresh (path, hook) {
  insertHook(path, hook, setHooks.beforeRefresh)
}

/**
 * Function to be called before a reefresh operation. They are executed synchrony and they can prevent the refresh, prevent the next hook from being executed, and set the second parameter to plugin.refresh.
 *
 * @callback BeforeRefreshHandler
 * @param {object} conext - context in which the hook is executed.
 * @param {string} context.url - url of the resource that has received the set
 * @param {object} context.params - the params captured on the url by the path. Like in express
 * @param {any} context.value - The current value. It can be changed.
 * @param {any} context.options - The
 * @param {boolean} context.preventHooks - set this to true to prevent the next hooks to be executed.
 * @param {boolean} context.preventRefresh - set this to true to prevent the resource callbacks to be executed.
 * @see beforeSet
 */
