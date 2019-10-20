import { plugins, conf } from './conf'

/**
 * Registers a plugin
 * When it comes to decide which plugin deals with an URL, the last registered ones are checked first. In other words, the check order is the inverted order of registration.
 *
 * @param {Plugin} plugin Plugin object to register
 */
export function registerPlugin (plugin) {
  conf.plugins[plugin.name] = conf.plugins[plugin.name] || {}
  plugin.conf = conf.plugins[plugin.name]
  plugins.unshift(plugin)
}

/**
 * @typedef {object} Plugin
 * @property {string} name Name of the Plugin. It must be unique. Mandatory for load and save.
 * @property {RegExp} regex Regex to match the resource's url
 * @property {cleanPluginHandler} [clean] Cleans up everything that is no more needed. Called by the garbage collector when it wants to clean a resource.
 * @property {getPluginHandler} [get] evaluates the value of the resource. Only synchronous evaluations.
 * @property {getResourcePluginHandler} [getResource] handler to the hook `getResource` that is called to
 * @property {loadPluginHandler} [load]
 * @property {loadResourcePluginHandler} [loadResource]
 * @property {savePluginHandler} [save]
 * @property {saveResourcePluginHandler} [saveResource] handler
 * @property {setPluginHandler} [set] establishes a new value for the resource.
 * @property {startPluginHandler} [start] Reset everything to get a fresh and clean state.
 * @property {refreshPluginHandler} [refresh] It is called by `refresh` to reevaluate the value
 * @property {object} [commands] Contains the commands. The keys are the name of the command, and the values the function that is called to execute the command.
 * @property {commandPlugin} [commands.someCommandName]
 * @property {commandPlugin} [commands.someOtherCommandName]
 * @property {commandPlugin} [commands.etc]
 * @see registerPlugin
 */
/**
 * Cleans all the stuff related with the resource that will not be needed after the garbage collector cleans the resource.
 * It can prevent the garbage collector to clean the resource returning true
 *
 * @callback cleanPluginHandler
 * @param {Resource} resource The resource to be cleaned
 * @returns {boolean} Return true to prevent the garbage collector to clean the state
 * @see registerPlugin
 */
/**
 * @callback commandPlugin
 * @param {string} url - The url of the resorce in which apply the command
 * @param {...any} [params] - Whatever params that are needed by the command
 * @returns {any} - Whatever value the command needs to return
 * @see command
 * @see registerPlugin
 */
/**
 * Evaluates the value of the resource
 * The evaluation must be done synchronously
 *
 * @callback getPluginHandler
 * @param {Resource} resource The resource whose value is going to be evaluated
 * @returns {any} the value of the resource
 * @see get
 * @see registerPlugin
 */
/**
 * It should set things up for the plugin to deal with the resource.
 * The plugin is allowed to add or modify properties to the resource
 *
 * @callback getResourcePluginHandler
 * @param {Resource} resource The resource that is being initialized
 * @see registerPlugin
 */
/**
 * Restores the plugin state from a previous saved one
 *
 * @callback loadPluginHandler
 * @params {Resource} resource
 * @see load
 * @see save
 * @see savePluginHandler
 * @see registerPlugin
 */
/**
 * Restores a resource from a previous saved one
 * If the plugin add keys to the resource at ist initialization, it might use this to do it at its restoration.
 *
 * @callback loadResourcePluginHandler
 * @params {Resource} resource
 * @see load
 * @see save
 * @see saveResourcePluginHandler
 * @see registerPlugin
 */
/**
 * Allows to save the state of the plugin, to be eventually loaded and restored.
 *
 * @callback savePluginHandler
 * @returns {any} Whatever serializable that the plugin needs to restore its current state.
 * @see save
 * @see registerPlugin
 */
/**
 * Allows the plugin to save the state of a resource.
 * The save system stores the url and the value of the resource. If the plugin needs to store something else there in the object that represents the state of the resource in order to be able to restore it later, it needs to update this object with this handler.
 *
 * @callback saveResourcePluginHandler
 * @param {string} url The url of the resource
 * @param {object} saveResource The object that represent the state of the resource.
 * @see save
 * @see registerPlugin
 */
/**
 * Allows the plugin to update the resource when a set operation is being performed
 *
 * @callback setPluginHandler
 * @description For instance, the localStorage plugin maps the urls with values stored at localStorage, so when a set operation is made, the plugin updates localstorage to the value of `resource.value`, using this handler.
 *
 * @param {Resource} resource
 * @see set
 * @see registerPlugin
 */
/**
 * Reset everything to get a fresh and clean state.
 *
 * @callback startPluginHandler
 * @description In universal applications, It is needed to reset the state each time a new html is prerrendered.
 * @see load
 * @see registerPlugin
 */
/**
 * It should reevaluate the resource and return his new value.
 * It must not update the value itself. The value must be returned to be updated by onget, to check if is different and trigger the subscriptions and callbacks.
 *
 * @callback refreshPluginHandler
 * @async
 * @param {Resource} resource The resource that needs to reevaluate
 * @see refresh
 * @see registerPlugin
 */
