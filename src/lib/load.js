import { loadPlugins, loadResources } from '../private/load'

/**
 * @summary Restores the state of the resources and plugins to a previous saved one.
 *
 * @description It is intended to be used in universal applications, that prerender the html clientside, to make the client state reflects the prerendered state.
 * @param {object} data is an object representing the state in which the application will be, after loading it.
 * @see save
 * @example
 * import { load } from 'onget'
 *
 * load(__PRELOADED_STATE__)
 */
export function load ({ resources, plugins }) {
  loadPlugins(plugins)
  loadResources(resources)
}
