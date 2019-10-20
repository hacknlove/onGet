import { resources } from './conf'
import { _set } from '../private//set'
import { pospone } from '../private/pospone'

/**
 * Check if the value of a resource has changed, and execute the subscriptions if so.
 * It makes the plugin reevaluate the value of the resorce, in those plugins that make periodical evaluations, or that uses some source that could have been changed with a `set` operation on the resource, like `localStorage` or `sessionStorage`
 *
 * @async
 * @param {string} url of the resources to be refreshed
 * @param {boolean} force Some plugins could include a debounce system te avoid reevaluate the value too much. Set force to true to ignore the threshold and force a check no matter how close it is from the previous one
 * @returns {boolean} False if there is nothing to refresh (the plugin does not support refresh or there is no resource with that url), true otherwise.
 * @example
 * import { afterSet, refresh } from 'onget'
 *
 *  afterSet('/api/cart/:item', async context => {
 *    await fetch(`/api/cart/${context.params.item}`, {
 *      method: 'POST',
 *      headers: {
 *        'Content-Type': 'application/json'
 *      },
 *      body: {
 *        amount: context.value
 *      }
 *    })
 *    refresh(`/api/stock/${context.params.item}`)
 * })
 */
export function refresh (url, force = false) {
  const resource = resources[url]
  if (!resource) {
    return false
  }
  resource.clean = undefined
  if (!resource.plugin.refresh) {
    return
  }
  if (!force && resource.plugin.conf.threshold !== undefined && Date.now() - resource.last < resource.plugin.conf.threshold) {
    return
  }
  pospone(resource)
  ;(async () => _set(resource, await resource.plugin.refresh(resource)))()
  return true
}
