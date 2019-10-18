import { plugins } from './conf'

/**
 * @summary Registers a plugin
 *
 * @description When it comes to decide which plugins deals with an URL, the last registered ones are checked first. The check order is the inverted order of registration.
 *
 * @param {Plugin} plugin Plugin object to register
 */
 export function registerPlugin (plugin) {
  plugins.unshift(plugin)
}

/**
 * @typedef {object} Plugin
 * @property {string} name Name of the Plugin. It must be unique. Mandatory for load and save.
 * @property {RegExp} regex Regex to match the resource's url
 * @property {number} [checkInterval] Default amount of milliseconds to reevaluate the resource. Mandatory for plugins that reevaluates the resource periodically.
 * @property {number} [threshold] Amount of milliseconds to in which a subsequent call to get, or onGet, uses the cached value instead of revaluating the resource. Mandatory for plugins that reevaluates the resource periodically.
 * @property {cleanPluginHandler} [clean] Cleans up everything that is no more needed. Called by the garbage collector when it wants to clean a resource.
 * @property {getPluginHandler} [get] evaluates the value of the resource. Only synchronous evaluations.
 * @property {getResourceHandler} [getResource] handler to the hook `getResource` that is called to
 * @property {loadResource} [load]
 * @property {savePluginHandler} [save]
 * @property {saveResourcePluginHandler} [saveResource] handler
 * @property {setPluginHandler} [set] establishes a new value for the resource.
 * @property {startPluginHandler} [start] Reset everything to get a fresh and clean state.
 * @property {refreshPluginHandler} [refresh] It is called by `refresh` to reevaluate the value
 * @property {object} [commands] Contains the commands. The keys are the name of the command, and the values the function that is called to execute the command.
 * @property {commandPlugin} [commands.someCommandName]
 * @property {commandPlugin} [commands.someOtherCommandName]
 * @property {commandPlugin} [commands.etc]
 */
/**
 * @callback cleanPluginHandler
 *
 * @summary Cleans all the stuff related with the resource that will not be needed after the garbage collector cleans the resource.
 *
 * @description It can prevent the garbage collector to clean the resource returning true
 *
 * @param {Resource} resource The resource to be cleaned
 * @returns {boolean} Return true to prevent the garbage collector to clean the state
 */
/**
 * @callback getPluginHandler
 *
 * @summary Evaluates the value of the resource
 *
 * @description The evaluation must be done synchronously
 *
 * @param {Resource} resource The resource whose value is going to be evaluated
 * @returns {any} the value of the resource
 */
/**
 * @callback getResourceHandler
 * @summary It should set things up for the plugin to deal with the resource.
 *
 * @description The plugin is allowed to add or modify properties to the resource
 *
 * @param {Resource} resource The resource that is being initialized
 */
/**
 * @callback loadResource
 *
 * @summary Restores a resource from a previous saved one
 *
 * @description If the plugin add keys to the resource at ist initialization, it might use this to do it at its restoration.
 *
 * @params {Resource} resource
 */
 /**
  * @callback savePluginHandler
  *
  * @summary Allows to save the state of the plugin, to be eventually loaded and restored.
  *
  * @returns {any} Whatever serializable that the plugin needs to restore its current state.
 */
 /**
  * @callback saveResourcePluginHandler
  *
  * @summary Allows the plugin to save the state of a resource.
  *
  * @description The save system stores the url and the value of the resource. If the plugin needs to store something else there in the object that represents the state of the resource in order to be able to restore it later, it needs to update this object with this handler.
  *
  * @param {string} url The url of the resource
  * @param {object} saveResource The object that represent the state of the resource.
 */
 /**
  * @callback setPluginHandler
  *
  * @summary Allows the plugin to update the resource when a set operation is being performed
  *
  * @description For instance, the localStorage plugin maps the urls with values stored at localStorage, so when a set operation is made, the plugin updates localstorage to the value of `resource.value`, using this handler.
  *
  * @param {resource}
 */
 /**
  * @callback startPluginHandler
  *
  * @summary Reset everything to get a fresh and clean state.
  *
  * @description In universal applications, It is needed to reset the state each time a new html is prerrendered.
 */
/**
 * @callback refreshPluginHandler
 * @summary It should reevaluate the resource and return his new value.
 *
 * @description It must not update the value itself. The value must be returned to be updated by onget, to check if is different and trigger the subscriptions and callbacks.
 * @async
 * @param {Resource} resource The resource that needs to reevaluate
 */
