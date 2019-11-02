'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var isdifferent = require('isdifferent');
var pathToRegExp = _interopDefault(require('path-to-regexp'));
var react = require('react');
var deepobject = require('@hacknlove/deepobject');

/**
 * @namespace
 * @property {number} CACHE_SIZE - The garbage colector is inactive when the amount of resources is less than CACHE_SIZE
 * @property {object} plugins - Stores the plugins configuration
 * @property {object} plugins.fetch - The configuration for the fetch plugin
 * @property {number} plugins.fetch.checkInterval - Size of the interval, in milliseconds, to check for new values doing a GET request
 * @property {number} plugins.fetch.threshold - Size of the windows, in milliseconds, in which a call to `get`, `onGet`, `refresh` or `useOnGet` will use the cached value instead of make a fetch
 * @property {object} plugins.anyCustomPluginName - Whatever configuration object that were needed by the plugin named `anyCustomPluginName`
 */
const conf = {
  CACHE_SIZE: 100,
  plugins: {
    fetch: {
      checkInterval: 30000,
      threshold: 500
    }
  }
};

const resources = {};
const plugins = [];
const setHooks = {
  beforeSet: [],
  afterSet: [],
  beforeRefresh: []
};

const serverInstances = [];

/**
 * Returns the first plugin whose regex matchs the url
 * @private
 * @param {string} url resource's url
 * @return plugin object
 */
function findPlugin (url) {
  return plugins.find(plugin => url.match(plugin.regex))
}

/**
 * Executes a command defined in a plugin, for an url
 *
 * @param {string} url the resource url
 * @param {string} command the command name
 * @param {...any} [params] the parameters to the command
 * @returns {any} The returned value of the plugin's command call
 * @see commandPlugin
 * @example
 * import { command } from 'onget'
 *
 * command('history://contact-form', 'undo')
 */
function command (url, command, ...params) {
  const resource = resources[url] || {
    plugin: findPlugin(url)
  };

  if (!resource.plugin.commands) {
    console.warn('the plugin does not accept commands');
    return
  }

  if (!resource.plugin.commands[command]) {
    console.warn('command not found');
    return
  }

  return resource.plugin.commands[command](url, ...params)
}

/**
 * Returns the value of a resource
 * If the resource has not been used yet, so it has no value cached, the plugin that deals with its url could evaluate the value. This is only possible when the evaluation is synchronous and the plugins has the `get` method defined.
 *
 * @param {string} url url of the resource
 * @returns {any} the cached value is exists, or an evaluated value if plugin.get exists
 * @example
 * import { get } from 'onget'
 * set('sessionStorage://foo', 42)
 * get('sessionStorage://foo') // 42
 * get('localStorage://foo') // undefined
 */
function get (url) {
  const resource = resources[url];
  if (resource) {
    resource.clean = undefined;
    return resources[url].value
  }
  const plugin = findPlugin(url);
  if (!plugin.get) {
    return undefined
  }
  return plugin.get(url)
}

/**
 * Restore the state of the plugins
 * @private
 * @param {object} savedPlugins as returned by savePlugins, called by save
 */
function loadPlugins (savedPlugins) {
  plugins.forEach(plugin => {
    if (!plugin.load || !savedPlugins[plugin.name]) {
      return
    }
    plugin.load(savedPlugins[plugin.name]);
  });
}

/**
 * restore the satate of the resources
 *
 * @private
 * @param {savedResources} as returned by saveResources, called by save
 */
function loadResources (savedResources) {
  Object.keys(savedResources).forEach(url => {
    const plugin = findPlugin(url);
    const resource = {
      ...savedResources[url],
      callbacks: {},
      url,
      plugin
    };
    if (plugin.conf.checkInterval) {
      resource.intervals = {};
      resource.minInterval = Infinity;
    }

    if (plugin.conf.threshold !== undefined) {
      resource.last = -Infinity;
    }
    if (plugin.loadResource) {
      plugin.loadResource(resource);
    }
    resources[url] = resource;
  });
}

/**
 * Restores the state of the resources and plugins to a previous saved one.
 * It is intended to be used in universal applications, that prerender the html clientside, to make the client state reflects the prerendered state.
 *
 * @param {object} data is an object representing the state in which the application will be, after loading it.
 * @see save
 * @example
 * import { load } from 'onget'
 *
 * load(__PRELOADED_STATE__)
 */
function load ({ resources, plugins }) {
  loadPlugins(plugins);
  loadResources(resources);
}

/**
 * Cleans unused resources. The ones that has no callbacks, no method called recently.
 * It is  intended to be called each time a new resource is created.
 * @private
 */
function clean () {
  const values = Object.values(resources);

  if (values.length < conf.CACHE_SIZE) {
    return
  }

  values.forEach(resource => {
    if (!resource.clean) {
      if (Object.keys(resource.callbacks).length === 0) {
        resource.clean = true;
      }
      return
    }
    if (resource.plugin.clean && resource.plugin.clean(resource)) {
      return
    }
    clearTimeout(resources[resource.url].timeout);
    delete resources[resource.url];
  });
}

/**
 * Creates if needed and returns the object that stores the callbacks, configuration and state of an resource
 * @private
 * @param {string} url resource's url
 * @param {any} [firstValue] is used as a firstValue, before any action was performed by the plugin
 * @returns {object} the resource
 */
function getResource (url, firstValue) {
  if (resources[url]) {
    return resources[url]
  }
  setTimeout(clean);
  const plugin = findPlugin(url);
  if (!plugin) {
    throw new Error(`No plugin for ${url}`)
  }
  const resource = {
    url,
    plugin,
    value: firstValue,
    callbacks: {}
  };
  resources[url] = resource;

  if (plugin.conf.checkInterval) {
    resource.intervals = {};
    resource.minInterval = Infinity;
  }

  if (plugin.conf.threshold !== undefined) {
    resource.last = -Infinity;
  }

  if (plugin.getResource) {
    plugin.getResource(resource);
  }

  return resource
}

/**
 * Function factory that creates and returns unsubscribe functions
 * @private
 * @param {object} resource from which unsubscribe
 * @param {strink} sk key that identifies the subscription
 */
function createUnsubscribe (resource, sk) {
  return () => {
    if (!resource.callbacks.hasOwnProperty(sk)) {
      return
    }

    delete resource.callbacks[sk];
    if (resource.intervals) {
      delete resource.intervals[sk];
      resource.minInterval = Math.min(...Object.values(resource.intervals));
    }
  }
}

/**
 * Adds the callback to the resource, updates the min interval configuration, and returns the unsubscribe function
 *
 * @private
 * @param {string} url resource's url
 * @param {Function} callback it will be called each time the value of the resource changes
 * @param {number} [interval] max interval (milliseconds) to check for a new value
 * @returns {Function} unsubscribe function
 */
function addNewSubscription (url, callback, interval) {
  const resource = resources[url];

  var sk;
  do {
    sk = Math.random().toString(36).substr(2) + (Date.now() % 1000).toString(36);
  } while (resource.callbacks[sk])
  resource.callbacks[sk] = callback;

  if (resource.intervals) {
    interval = interval || resource.plugin.conf.checkInterval;
    resource.intervals[sk] = interval;
    resource.minInterval = Math.min(resource.minInterval, interval);
  }

  return createUnsubscribe(resource, sk)
}

/**
 * set that does not call events
 * @private
 * @param {object} resource to be updated
 * @param {*} value to update the resource with
 * @param {boolean} preventRefresh to avoid calling the resource callbacks
 */
function _set (resource, value, preventRefresh) {
  if (!isdifferent.isDifferent(value, resource.value)) {
    return
  }
  const oldValue = resource.value;
  resource.value = value;
  if (resource.plugin.set) {
    resource.plugin.set(resource, oldValue, preventRefresh);
  }
  if (!preventRefresh) {
    Object.values(resource.callbacks).forEach(cb => cb(resource.value));
  }
}

/**
 * Pospone the refresh of the resource
 * @private
 * @param {object} resource resource whose refresh should be posponed, as returned by getResource(url)
 * @returns undefined
 */
function pospone (resource) {
  if (!resource.intervals) {
    return
  }
  clearTimeout(resource.timeout);
  if (!resources[resource.url]) {
    return
  }
  resource.last = Date.now();
  resource.timeout = setTimeout(() => {
    refresh(resource.url);
  }, resource.minInterval);
}

/**
 * Execute all the hooks that match an url
 *
 * @private
 * @param {Array} where array to search for the hook
 * @param {object} context object to be passed to the hook
 * @returns {object} the context object, it might be modified by the hooks
 */
function executeHooks (where, context) {
  for (let i = 0, z = where.length; i < z; i++) {
    if (context.preventHooks) {
      break
    }
    const [regex, keys, cb] = where[i];
    const match = context.url.match(regex);
    if (!match) {
      continue
    }
    context.params = {};
    for (let i = 1; i < match.length; i++) {
      context.params[keys[i - 1].name] = match[1];
    }

    cb(context);
  }

  return context
}

/**
 * Prepares the regex that match the path patters, and insert the hook in the indicated array
 *
 * @private
 * @param {string} path the same format of express. (path-to-regexp)
 * @param {afterSetHook|BeforeSetHook} hook Function to be called at hook time
 * @param {Array} where array to insert the hook in
 */
function insertHook (path, hook, where) {
  const keys = [];
  const regex = pathToRegExp(path, keys);
  where.push([regex, keys, hook]);
}

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
function refresh (url, force = false) {
  const resource = resources[url];
  if (!resource) {
    return false
  }
  resource.clean = undefined;
  if (!resource.plugin.refresh) {
    return
  }

  const beforeRefresh = executeHooks(setHooks.beforeRefresh, {
    force,
    url
  });
  if (beforeRefresh.value !== undefined) {
    return _set(resource, beforeRefresh.value)
  }
  if (beforeRefresh.preventRefresh) {
    return
  }
  if (!beforeRefresh.force && resource.plugin.conf.threshold !== undefined && Date.now() - resource.last < resource.plugin.conf.threshold) {
    return
  }
  pospone(resource)
  ;(async () => _set(resource, await resource.plugin.refresh(resource, beforeRefresh.options)))();
  return true
}

/**
 * Set a handler to be called each time the value of a resource changes
 * The handler is attached to a resource, (not to a path that could match several resources), and it will be called after the value changes.
 * If the value has changed because of a `set` operation, `context.preventRefresh` could prevent the handler to be executed if it were set to true by any `beforeSet` or `afterSet` handler.
 *
 * @param {string} url The resource to subscribe to
 * @param {handler} cb handler to be called
 * @param {object} [options={}] subscription's options
 * @param {any} options.first first value to initiate the resorce with
 * @param {number} options.interval Some plugins, evaluates periodically the value of the resource. Tha actual amount of milliseconds will be the minimum `options.interval` of every `option.interval`s of every subscriptions on the resource
 * @returns {Function} unsubscribe function
 * @see useOnGet
 * @example
 * import { onGet } from 'onget'
 * onGet('/api/posts', value => {
 *  console.log(value)
 * }, {
 *  interval: 5000
 * })
 */
function onGet (url, cb, options = {}) {
  const {
    first,
    interval
  } = options;
  const resource = getResource(url, first);

  const unsubscribe = addNewSubscription(url, cb, interval);
  resource.clean = undefined;

  if (resource.value !== undefined) {
    cb(resource.value);
  }
  if (Date.now() - resource.last > resource.plugin.conf.threshold) {
    refresh(url);
  }
  return unsubscribe
}

/**
 * @callback handler
 * @param {any} value The value of the resource
 */

/**
 * Attach a handler, that will be executed at most once, to the eventual change the the value of resource.
 * The handler is attached to a resource, not to a path that could match several resources, and it will be called after the value changes.
 *
 * If the value has changed because of a `set` operation, `context.preventRefresh` could prevent the handler to be executed if it were set to true by any `beforeSet` or `afterSet` handler.
 *
 * @param {string} url The url of a single resource.
 * @param {onceHandler} handler function that will be executed the first time the resource's value changes
 * @returns {Function} a detach function that could be called to detach the handler
 * @see waitUntil
 * @see onGet
 * @see useOnGet
 * @example
 * import { once, set } from 'onget'
 *
 * once('dotted://hello', value => alert(`hello ${value}`))
 * set('dotted://hello', 'world') // handler will be executed
 * set('dotted://hello', 'cow') // handler will not be executed
 */
function once (url, handler) {
  const detach = onGet(url, value => {
    detach();
    handler(value, url);
  });
  return detach
}

/**
 * @callback onceHandler
 * @param {any} value
 * @param {string} url of the resource whose value has change
 */

/**
 * @summary Refresh every resource that matches the regular expression.
 *
 * @param {RegExp} regex to test against the resources' urls
 * @param {boolean} force to pass to refresh
 * @example
 * import { refreshRegExp } from 'onget'
 * document.getElementById('reload').addEventListener('click', () => {
 *    refreshRegExp(/^\/api\//)
 * })
 */
function refreshRegExp (regex, force) {
  Object.values(resources).forEach(resource => {
    if (regex.test(resource.url)) {
      refresh(resource.url, force);
    }
  });
}

/**
 * Registers a plugin
 * When it comes to decide which plugin deals with an URL, the last registered ones are checked first. In other words, the check order is the inverted order of registration.
 *
 * @param {Plugin} plugin Plugin object to register
 */
function registerPlugin (plugin) {
  conf.plugins[plugin.name] = conf.plugins[plugin.name] || {};
  plugin.conf = conf.plugins[plugin.name];
  plugins.unshift(plugin);
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

/**
 * @private
 * @return {object} serializable with the minimun data to restore the resources.
 */
function savedResources () {
  const saved = {};
  Object.values(resources).forEach(resource => {
    const savedResource = {
      value: resource.value
    };

    if (resource.plugin.saveResource) {
      resource.plugin.saveResource(resource.url, savedResource);
    }

    if (!savedResource.preventSave) {
      saved[resource.url] = savedResource;
    }
  });
  return saved
}

/**
 * @private
 * @return {object} with the minimun data to restore the plugin state
 */
function savedPlugins () {
  const savedPlugins = {};
  plugins.forEach(plugin => {
    if (!plugin.save) {
      return
    }
    const savedPlugin = plugin.save();
    if (!savedPlugin) {
      return
    }
    savedPlugins[plugin.name] = savedPlugin;
  });
  return savedPlugins
}

/**
 * @summary Save the state of the resources and the plugins
 *
 * @description It returns a serializable object that represents the current state of the resources and the plugins in a way that can be used eventually by load to restore the same state.
 *
 * @returns {object} the serializable object
 */
function save () {
  return {
    resources: savedResources(),
    plugins: savedPlugins()
  }
}

/**
 * set a new cached value for an resource, and call the handlers. If the resource does not exists, it creates it.
 *
 * @param {string} url  of the resource whose value set to.
 * @param {any} value value to series.
 * @param {object} options to determine the behaviour of the set, and to be passed to the hooks.
 * @param {boolean} options.preventPospone if true, it prevents to pospone the next check.
 * @param {boolean} event.preventHooks if true, prevent the hooks to be executed.
 * @param {boolean} event.preventRefresh if true, prevents the resource callbacks to be executed.
 * @param {boolean} event.preventSet if true to prevent the whole set operation, except the beforeSetHooks
 */
function set (url, value, options = {}) {
  const beforeResult = executeHooks(setHooks.beforeSet, {
    ...options,
    url,
    value
  });
  if (beforeResult.preventSet) {
    return
  }
  const resource = resources[url];
  value = beforeResult.value;
  options.preventPospone = beforeResult.preventPospone;

  if (!resource) {
    const resource = getResource(url, value);
    if (resource.plugin.set) {
      resource.value = value;
      resource.plugin.set(resource);
    }
    executeHooks(setHooks.afterSet, {
      ...options,
      url,
      value
    });
    return
  }

  const oldValue = resource.value;

  resource.clean = undefined;
  if (resource.intervals && !options.preventPospone) {
    pospone(resource);
  }
  _set(resource, value, beforeResult.preventRefresh);
  executeHooks(setHooks.afterSet, {
    ...options,
    url,
    oldValue,
    value
  });
}

/**
 * Attach a handler for an express-like path, that will be executed before any set operation on the resources whose url match that path.
 * From inside the handler it is possible to modify the value to be set, prevent the next beforeSet and afterSet handlers to be executed, prevent the subscription callbacks to be executed, or prevent the whole to be set to take place.
 *
 * @param {string} path express-like path to check in which resources execute the hook
 * @param {BeforeSetHandler} hook Function to be called
 * @see set
 * @see afterSet
 * @example
 *  import { beforeSet, set } from 'onget'
 *
 *  beforeSet(`localStorage://username`, context => {
 *    context.value = context.value.trim().toLowerCase()
 *  })
 *
 *  beforeSet(`localStorage://email`, context => {
 *    if (context.value.match(/@/) === null) {
 *      context.preventSet = true
 *      set('dotted://errors.email', true)
 *    }
 *  })
 */
function beforeSet (path, hook) {
  insertHook(path, hook, setHooks.beforeSet);
}

/**
 * Function to be called before a set operation. They are executed synchrony and they can modify, even prevent, the set.
 *
 * @callback BeforeSetHandler
 * @param {object} event context in which the hook is executed.
 * @param {string} event.url url of the resource that has received the set
 * @param {object} event.params the params captured on the url by the path. Like in express
 * @param {*} event.value The current value. It can be changed.
 * @param {boolean} event.preventHooks set this to true to prevent the next hooks to be executed.
 * @param {boolean} event.preventRefresh set this to true to prevent the resource callbacks to be executed.
 * @param {boolean} event.preventSet set this to true to prevent the whole set operation (except the next hooks, that can be prevented with preventHooks)
 * @param {boolean} event.preventPospone set this to true to prevent the next periodical check to be posponed
 * @see beforeSet
 */

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
function beforeRefresh (path, hook) {
  insertHook(path, hook, setHooks.beforeRefresh);
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

/**
 * Attach a handler for an express-like path, that will be executed after any set operation the the resources whose url match that path.
 * From inside the handler it is possible to prevent the next afterSet handlers to be executed.
 * @param {string} path Pattern to check in which resources execute the hook
 * @param {afterSetHandler} hook Function to be called
 * @see set
 * @see beforeSet
 */
function afterSet (path, hook) {
  insertHook(path, hook, setHooks.afterSet);
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

/**
 * @summary Wait until the system is free to do a server side prerrender, and then set it to not-free
 */
async function start () {
  const instance = {};

  instance.promise = new Promise(resolve => { instance.resolve = resolve; });

  serverInstances.unshift(instance);

  if (serverInstances[1]) {
    await serverInstances[1].promise;
  }

  plugins.forEach(plugin => {
    if (plugin.start) {
      plugin.start();
    }
  });
}

/**
 * Indicates that the prerrendering has finished and allows the next prerrendering to begin.
 * It is used in server-side prerrendering along with `start`
 *
 * @see start
 */
function end () {
  Object.keys(resources).forEach(key => delete resources[key]);

  plugins.forEach(plugin => {
    if (plugin.end) {
      plugin.end();
    }
  });

  const instance = serverInstances.pop();
  instance.resolve();
}

/**
 * React hook that reload the component when the resource's value change
 *
 * @param {string} url the url to subscribe to
 * @param {object} options options
 * @param {any} options.first The first value to be used. Useful with asynchronous resources, when there is no value cached yet.
 * @param {boolean} options.firstIfUrlChanges When the url changes, the first value returned for the new url will be the last value of the last url, unless `options.firstIfUrlChanges` be truthy
 * @returns the current value
 */
function useOnGet (url, options = {}) {
  let [value, set] = react.useState(() => get(url) || options.first);

  if (options.firstIfUrlChanges) {
    value = get(url) || options.first;
  }

  react.useEffect(() => {
    return onGet(url, set, options)
  }, [url]);

  return value
}

/**
 * Used with await, stops the execution of a function until the resorce value meets some condition that defaults to be truthy
 *
 * @param {*} url the url of the resource
 * @param {*} condition the condition that should be met
 * @returns {Promise} A promise that will be resolved when the condition will be met
 */
function waitUntil (url, condition = value => value) {
  return new Promise(resolve => {
    const unsubscribe = onGet(url, value => {
      if (condition(value, url)) {
        unsubscribe();
        resolve(value);
      }
    });
  })
}

/* global fetch */

var fetch$1 = {
  name: 'fetch',
  regex: /^./,
  async refresh (resource, options) {
    const response = await fetch(resource.url, options).catch(__error => ({ __error }));
    if (response.__error) {
      return response.__error
    }
    const raw = await response.text();
    let value;
    try {
      value = JSON.parse(raw);
    } catch (e) {
      value = raw;
    }
    return value
  },
  start () {
    conf.plugins.fetch.checkInterval = undefined;
    conf.plugins.fetch.threshold = undefined;
  }
};

/* global localStorage */
const PROTOCOLCUT = 'localStorage://'.length;

function parseIfPossible (value) {
  try {
    return JSON.parse(value)
  } catch (e) {
    return value
  }
}

function onChange (resource) {
  if (!global.addEventListener || !global.removeEventListener) {
    return
  }
  function listener () {
    if (localStorage[resource.key] === JSON.stringify(resource.value)) {
      return
    }
    resource.value = parseIfPossible(localStorage[resource.key]);
    Object.values(resource.callbacks).forEach(cb => cb(resource.value));
  }
  global.addEventListener('storage', listener);
  return () => {
    global.removeEventListener(listener);
  }
}

const plugin = {
  name: 'localStorage',
  regex: /^localStorage:\/\/./i,
  refresh (resource) {
    return parseIfPossible(localStorage[resource.key])
  },
  getResource (resource) {
    resource.unsubscribeStorage = onChange(resource);
    resource.key = resource.url.substr(PROTOCOLCUT);

    if (localStorage[resource.key] !== undefined) {
      resource.value = parseIfPossible(localStorage[resource.key]);
      return
    }

    if (resource.value === undefined) {
      return
    }
    localStorage[resource.key] = JSON.stringify(resource.value);
  },
  get (url) {
    return parseIfPossible(localStorage[url.substr(PROTOCOLCUT)])
  },
  set (resource) {
    if (resource === undefined) {
      return delete localStorage[resource.key]
    }
    localStorage[resource.key] = JSON.stringify(resource.value);
  },
  clean (resource) {
    resource.unsubscribeStorage && resource.unsubscribeStorage();
  },
  start () {
    global.localStorage = {};
  }
};

/* global sessionStorage */
const PROTOCOLCUT$1 = 'sessionStorage://'.length;

function parseIfPossible$1 (value) {
  try {
    return JSON.parse(value)
  } catch (e) {
    return value
  }
}

const plugin$1 = {
  name: 'sessionStorage',
  regex: /^sessionStorage:\/\/./i,
  refresh (resource, eventHandler) {
    return parseIfPossible$1(sessionStorage[resource.key])
  },
  getResource (resource) {
    resource.key = resource.url.substr(PROTOCOLCUT$1);

    if (sessionStorage[resource.key] !== undefined) {
      resource.value = parseIfPossible$1(sessionStorage[resource.key]);
      return
    }

    if (resource.value === undefined) {
      return
    }
    sessionStorage[resource.key] = JSON.stringify(resource.value);
  },
  get (url) {
    return parseIfPossible$1(sessionStorage[url.substr(PROTOCOLCUT$1)])
  },
  set (resource) {
    if (resource === undefined) {
      return delete sessionStorage[resource.key]
    }
    sessionStorage[resource.key] = JSON.stringify(resource.value);
  },

  start () {
    global.sessionStorage = {};
  }
};

var state = {};

function cleanUrlAndGetHistory (url, command, ...params) {
  const history = state[url.replace(/#-?\d+$/, '')];
  if (history) {
    return history
  }
  if (command && url === 'history://' && plugin$2.commands[command]) {
    Object.keys(state).forEach(url => plugin$2.commands[command](url, ...params));
  }
}

function getRelativeValue (url, n) {
  const history = state[url];
  if (!history) {
    return
  }

  const absolute = history.cursor - n;

  if (absolute < 0) {
    return undefined
  }

  if (absolute >= history.history.length) {
    return undefined
  }

  return history.history[absolute]
}

function propagate (url) {
  const prefix = `${url}#`;
  Object.values(resources).forEach(resource => {
    if (!resource.relative) {
      return
    }
    if (!resource.url.startsWith(prefix)) {
      return
    }
    const newValue = getRelativeValue(resource.relative.url, resource.relative.n);
    if (isdifferent.isDifferent(newValue, resource.value)) {
      resource.value = newValue;
      executeCallbacks(resource.url);
    }
  });
}

function executeCallbacks (url) {
  const resource = resources[url];
  if (!resource) {
    return
  }
  Object.values(resource.callbacks).forEach(cb => cb(resource.value));
}

function updateresource (url) {
  const resource = resources[url];
  if (!resource) {
    return
  }
  const history = state[url];
  resource.value = history.history[history.cursor];
  executeCallbacks(url);
}

const plugin$2 = {
  name: 'history',
  regex: /^history:\/\/./,

  /**
   * Nothing to refresh. shows a warning in the console
   * @returns {undefined}
   */
  refresh () {
    console.warn('refresh does nothing with history:// plugin');
  },

  /**
   * If the state has not value for this resource.url, creates a new updated state
   * else, set resource.value according to the state
   * @param {object} resource
   */
  getResource (resource) {
    const relative = resource.url.match(/(.*)#(-?\d+)$/);

    if (!relative) {
      state[resource.url] = {
        history: [resource.value],
        cursor: 0
      };
      return
    }

    resource.relative = {
      url: relative[1],
      n: relative[2] * 1
    };

    resource.value = getRelativeValue(relative[1], relative[2] * 1);
  },

  get (url) {
    if (state[url]) {
      return state[url].history[state[url].cursor]
    }
    const relative = url.match(/(.*)#(-?\d+)$/);
    if (!relative) {
      return
    }
    return getRelativeValue(relative[1], relative[2] * 1)
  },

  /**
   * Updates the resource.value, and propagates up and down
   * @param {object} resource
   * @returns {undefined}
   */
  set (resource) {
    const relative = resource.relative;

    if (!relative) {
      const history = state[resource.url];
      if (!isdifferent.isDifferent(resource.value, history.history[history.cursor])) {
        return
      }
      if (history.cursor < history.history.length - 1) {
        history.history.splice(history.cursor + 1);
      }
      history.history.push(resource.value);
      history.cursor++;
      propagate(resource.url);
      return
    }

    const history = state[relative.url];
    if (!history) {
      return
    }

    const absolute = history.cursor - relative.n;

    if (absolute < 0) {
      return
    }

    if (absolute >= history.history.length) {
      return
    }

    history.history[absolute] = resource.value;
  },

  /**
   * Removes the history
   * @param {object} resource
   * @returns {undefined}
   */
  clean (resource) {
    const url = resource.url.replace(/#-?\d+$/, '');
    if (!state[resource.url]) {
      return
    }

    if (resources[url] && !resources[url].clean) {
      return
    }

    if (Object.values(resources).some(resource => {
      if (resource.clean) {
        return false
      }
      if (!resource.relative) {
        return false
      }
      if (resource.relative.url !== url) {
        return false
      }
      return true
    })) {
      return
    }
    delete state[resource.url];
  },

  start () {
    state = {};
  },

  saveResource (url, savedResource) {
    savedResource.preventSave = true;
  },

  save () {
    const data = [];
    Object.keys(state).forEach(key => {
      const history = state[key];
      data.push([
        key,
        history.history[history.cursor]
      ]);
    });
    return data.length ? data : undefined
  },

  load (data) {
    state = {};
    data.forEach(history => {
      state[history[0]] = {
        history: [history[1]],
        cursor: 0
      };
    });
  },

  commands: {
    replace (url, value) {
      url = url.replace(/#-?\d+$/, '');
      const history = state[url];

      if (!history) {
        console.warn('cannot replace. History not found');
        return
      }

      if (history.cursor < history.history.length - 1) {
        history.history.splice(history.cursor + 1);
      }
      history.history[history.cursor] = value;

      updateresource(url);
      propagate(url);
    },
    undo (url, n = 1) {
      n = Math.floor(n * 1);
      const history = cleanUrlAndGetHistory(url, 'undo', n);
      if (!history) {
        return
      }
      history.cursor = Math.max(0, history.cursor - n);
      updateresource(url);
      propagate(url);
    },
    redo (url, n = 1) {
      n = Math.floor(n * 1);
      const history = cleanUrlAndGetHistory(url, 'redo', n);
      if (!history) {
        return
      }
      history.cursor = Math.min(history.cursor + n, history.history.length - 1);
      updateresource(url);
      propagate(url);
    },
    goto (url, n) {
      n = Math.floor(n * 1);
      const history = cleanUrlAndGetHistory(url, 'goto', n);
      if (!history) {
        return
      }
      history.cursor = Math.max(
        0,
        Math.min(
          n,
          history.history.length - 1
        )
      );
      updateresource(url);
      propagate(url);
    },
    first (url) {
      plugin$2.commands.undo(url, Infinity);
    },
    last (url) {
      plugin$2.commands.redo(url, Infinity);
    },
    length (url) {
      const history = cleanUrlAndGetHistory(url);
      if (!history) {
        return 0
      }
      return history.history.length
    },
    undoLength (url) {
      const history = cleanUrlAndGetHistory(url);
      if (!history) {
        return 0
      }
      return history.cursor
    },
    redoLength (url) {
      const history = cleanUrlAndGetHistory(url);
      if (!history) {
        return 0
      }
      return history.history.length - history.cursor - 1
    }
  }
};

var state$1 = {};

/**
 * For each resource whose url is a parent of url, update his value and call his callbacks
 *
 * dotted://foo.bar is a parent of dotted://foo.bar.buz
 * @private
 * @param {string} url
 * @returns {undefined}
 */
function propagateUp (url) {
  const parentUrl = url.replace(/\.?[^.]*$/, '');
  if (!parentUrl) {
    return
  }
  const resource = resources[parentUrl];

  if (resource) {
    resource.value = deepobject.getValue(state$1, resource.url);
    Object.values(resource.callbacks).forEach(cb => cb(resource.value));
  }
  propagateUp(parentUrl);
}

/**
 * For each resource whose url is a child of url, if his value has changed, update it and call his callbacks
 *
 * dotted://foo.bar.buz is a parent of dotted://foo.bar
 * @private
 * @param {string} url
 * @returns {undefined}
 */
function propagateDown (url) {
  const parent = resources[url];
  const prefix = `${url}.`;
  Object.keys(resources).forEach(childUrl => {
    if (!childUrl.startsWith(prefix)) {
      return
    }
    const child = resources[childUrl];
    const newChildValue = deepobject.getValue(parent.value, childUrl.substr(url.length + 1));

    if (isdifferent.isDifferent(newChildValue, child.value)) {
      child.value = newChildValue;
      Object.values(child.callbacks).forEach(cb => cb(newChildValue));
    }
  });
}

var dotted = {
  name: 'dotted',
  regex: /^dotted:\/\/./,

  /**
   * Nothing to refresh. shows a warning in the console
   * @returns {undefined}
   */
  refresh () {
    console.warn('the true source for this plugin is client side, so refresh does nothing');
  },

  /**
   * If the state has not value for this resource.url, creates a new updated state
   * else, set resource.value according to the state
   * @param {object} resource
   */
  getResource (resource) {
    const actualValue = deepobject.getValue(state$1, resource.url);
    if (actualValue === undefined) {
      state$1 = deepobject.setValue(state$1, resource.url, resource.value);
      propagateUp(resource.url);
      propagateDown(resource.url);
      return
    }
    resource.value = actualValue;
  },

  /**
   * Returns the value at the state
   * @param {string} url
   * @returns {object} the value
   */
  get (url) {
    return deepobject.getValue(state$1, url)
  },

  /**
   * Updates the resource.value, and propagates up and down
   * @param {object} resource
   * @returns {undefined}
   */
  set (resource) {
    state$1 = deepobject.setValue(state$1, resource.url, resource.value);
    propagateUp(resource.url);
    propagateDown(resource.url);
  },

  /**
   * If there is no children resource, delete the value, and propagate up
   * @param {object} resource
   * @returns {undefined}
   */
  clean (resource) {
    const prefix = `${resource.url}.`;
    if (Object.keys(resources).some(url => url.startsWith(prefix))) {
      return
    }
    propagateUp(resource.url);
  },

  start () {
    state$1 = {};
  },

  saveResource (url, savedResource) {
    savedResource.preventSave = true;
  },

  save () {
    return Object.keys(state$1).length ? state$1 : undefined
  },

  load (data) {
    state$1 = data;
  },

  commands: {
    remove (url) {
      state$1 = deepobject.deleteValue(state$1, url);
      propagateUp(url);
      propagateDown(url);
    }
  }
};

var fast = {
  name: 'fast',
  regex: /^fast:\/\/./
};

registerPlugin(fetch$1);
registerPlugin(plugin);
registerPlugin(plugin$1);
registerPlugin(plugin$2);
registerPlugin(dotted);
registerPlugin(fast);

exports.afterSet = afterSet;
exports.beforeRefresh = beforeRefresh;
exports.beforeSet = beforeSet;
exports.command = command;
exports.conf = conf;
exports.end = end;
exports.get = get;
exports.load = load;
exports.onGet = onGet;
exports.once = once;
exports.plugins = plugins;
exports.refresh = refresh;
exports.refreshRegExp = refreshRegExp;
exports.registerPlugin = registerPlugin;
exports.resources = resources;
exports.save = save;
exports.set = set;
exports.start = start;
exports.useOnGet = useOnGet;
exports.waitUntil = waitUntil;
