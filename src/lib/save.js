import { savedPlugins, savedResources } from '../private/save'

/**
 * @summary Save the state of the resources and the plugins
 *
 * @description It returns a serializable object that represents the current state of the resources and the plugins in a way that can be used eventually by load to restore the same state.
 *
 * @returns {object} the serializable object
 */
export function save () {
  return {
    resources: savedResources(),
    plugins: savedPlugins()
  }
}
