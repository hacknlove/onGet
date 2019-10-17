import { isDifferent } from 'isdifferent'

/**
 * set that does not call events
 * @private
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
