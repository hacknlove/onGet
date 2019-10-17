
import { savedPlugins, savedresources } from '../private/save'

/**
 * @return {object} an object that represents the current state of the application, and that can be serialized
 */
export function save () {
  return {
    resources: savedresources(),
    plugins: savedPlugins()
  }
}
