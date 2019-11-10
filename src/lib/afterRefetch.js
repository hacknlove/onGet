import { setHooks } from './conf'
import { insertHook } from '../private/setHooks'

/**
 * Attach a handler for an express-like path, that will be executed after any refresh operation on the resources whose url match that path.
 * From inside the handler it is possible to add more parameters to the call to plugin.
 *
 * @param {string} path express-like path to check in which resources execute the hook
 * @param {afterRefetchHandler} hook Function to be called
 * @see refresh
 * @example
 *  import { afterRefetch, refresh } from 'onget'
 *
 *  afterrefetch('/api/user/current', context => {
 *    const token = get('localStorage://token')
 *    context.options = {
 *      headers: { 'Authorization': `Bearer ${token}` }
 *    }
 *  })
 *
 *  refresh('/api/user/current')
 */
export function afterRefetch (path, hook) {
  insertHook(path, hook, setHooks.afterRefetch)
}

/**
 * Function to be called after a refresh operation. They are executed synchrony and they can prevent the refresh, prevent the next hook from being executed, and set the second parameter to plugin.refresh.
 *
 * @callback afterRefetchHandler
 * @param {object} conext - context in which the hook is executed.
 * @param {string} context.url - url of the resource that has received the set
 * @param {string} context.path path part of the url
 * @param {string} context.search search part of the url
 * @param {string} context.hash hash part of the url
 * @param {object} context.params - the params captured on the url by the path. Like in express
 * @param {any} context.value - The current value. It can be changed.
 * @param {any} context.options - The options that will be passed to plugin.refresh
 * @param {boolean} context.preventHooks - set this to true to prevent the next hooks to be executed.
 * @param {boolean} context.preventRefresh - set this to true to prevent the resource callbacks to be executed.
 * @see afterSet
 */
