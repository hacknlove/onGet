'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var isdifferent = require('isdifferent');
var pathToRegExp = _interopDefault(require('path-to-regexp'));
var react = require('react');
var deepobject = require('@hacknlove/deepobject');

const conf = {
  CACHE_SIZE: 100
};
const resources = {};
const plugins = [];
const setHooks = {
  before: [],
  after: []
};

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
 *Executes a command defined in a plugin, for an url
 *
 * @param {string} url the resource url
 * @param {string} command the command name
 * @param {*} params the parameters to the command
 * @returns
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
 * Returns the cached value for the resource
 * @param {string} url url of the resource
 * @param {boolean} onlyCached=true, set to false to force the plugin to obtain a value if none if cached
 * @returns {any} the cached value is exists, or an evaluated value if plugin.get exists
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
 * @private
 * @param {savedresources} as returned by saveresources, called by save
 */
function loadresources (savedresources) {
  Object.keys(savedresources).forEach(url => {
    const plugin = findPlugin(url);
    const resource = {
      ...savedresources[url],
      callbacks: {},
      url,
      plugin
    };
    if (plugin.checkInterval) {
      resource.intervals = {};
      resource.minInterval = Infinity;
    }

    if (plugin.threshold !== undefined) {
      resource.last = -Infinity;
    }
    if (plugin.load) {
      plugin.load(resource);
    }
    resources[url] = resource;
  });
}

/**
 * Loads a state
 * @param {object} data is an object representing the state in which the application will be, after loading it.
 */
function load ({ resources, plugins }) {
  loadPlugins(plugins);
  loadresources(resources);
}

/**
 * Cleans unused resources. The ones that has no callbacks, no method called recently.
 * It is  intended to be called each time a new resource is created
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

  if (plugin.checkInterval) {
    resource.intervals = {};
    resource.minInterval = Infinity;
  }

  if (plugin.threshold !== undefined) {
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
 * @private
 * @param {string} url resource's url
 * @param {function} callback it will be called each time the value of the resource changes
 * @param {number} [interval] max interval (milliseconds) to check for a new value
 * @return {function} unsubscribe function
 */
function addNewSubscription (url, callback, interval) {
  const resource = resources[url];

  var sk;
  do {
    sk = Math.random().toString(36).substr(2) + (Date.now() % 1000).toString(36);
  } while (resource.callbacks[sk])
  resource.callbacks[sk] = callback;

  if (resource.intervals) {
    interval = interval || resource.plugin.checkInterval;
    resource.intervals[sk] = interval;
    resource.minInterval = Math.min(resource.minInterval, interval);
  }

  return createUnsubscribe(resource, sk)
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
 * Internal set, that does not call events
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
 * Internal. Execute all the hooks that match an url
 * @param {array} where array to search for the hook
 * @param {object} event object to be passed to the hook
 * @return {object} the event object, it might be modified by the hooks
 */
function executeHooks (where, event) {
  for (let i = 0, z = where.length; i < z; i++) {
    if (event.preventHooks) {
      break
    }
    const [regex, keys, cb] = where[i];
    const match = event.url.match(regex);
    if (!match) {
      continue
    }
    event.params = {};
    for (let i = 1; i < match.length; i++) {
      event.params[keys[i - 1].name] = match[1];
    }

    cb(event);
  }

  return event
}

/**
 * Internal. Prepares the regex that match the path patters, and insert the hook in the indicated array
 * @param {string} path the same format of express. (path-to-regexp)
 * @param {(afterSetHook|BeforeSetHook)} hook Function to be called at hook time
 * @param {array} where array to insert the hook in
*/
function insertHook (path, hook, where) {
  const keys = [];
  const regex = pathToRegExp(path, keys);
  where.push([regex, keys, hook]);
}

/**
 * set a new cached value for an resource, and call the handlers. If the resource does not exists, it creates it.
 * @param {string} url  of the resource whose value set to
 * @param {any} value value to series
 * @param {object} options to determine the behaviour of the set, and to be passed to the hooks
 * @param {boolean} options.preventPospone if true, it prevents to pospone the next check
 * @param {boolean} event.preventHooks if true, prevent the hooks to be executed.
 * @param {boolean} event.preventRefresh if true, prevents the resource callbacks to be executed.
 * @param {boolean} event.preventSet if true to prevent the whole set operation, except the beforeSetHooks
 */
function set (url, value, options = {}) {
  const beforeResult = executeHooks(setHooks.before, {
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
    return executeHooks(setHooks.after, {
      ...options,
      url,
      value
    })
  }

  const oldValue = resource.value;

  resource.clean = undefined;
  if (resource.intervals && !options.preventPospone) {
    pospone(resource);
  }
  _set(resource, value, beforeResult.preventRefresh);
  return executeHooks(setHooks.after, {
    ...options,
    url,
    oldValue,
    value
  })
}

/**
 * Insert a hook to be executed before doing the set. They can prevent the set, modify the value to be set, prevent to be set
 * @param {string} path Pattern to check in which resources execute the hook
 * @param {BeforeSetHook} hook Function to be called
 */
function beforeSet (path, hook) {
  insertHook(path, hook, setHooks.before);
}

/**
 * Insert a hook to be executed after doing the set. They  modify the value to be set
 * @param {string} path Pattern to check in which resources execute the hook
 * @param {afterSetHook} hook Function to be called
 */
function afterSet (path, hook) {
  insertHook(path, hook, setHooks.after);
}

/**
 * Function to be called before a set operation. They are executed synchrony and they can modify, even prevent, the set.
 * @function BeforeSetHook
 * @param {object} event context in which the hook is executed
 * @param {string} event.url url of the resource that has received the set
 * @param {*} event.value The current value. It can be changed.
 * @param {boolean} event.preventHooks set this to true to prevent the next hooks to be executed.
 * @param {boolean} event.preventRefresh set this to true to prevent the resource callbacks to be executed.
 * @param {boolean} event.preventSet set this to true to prevent the whole set operation (except the next hooks, that can be prevented with preventHooks)
 * @param {boolean} event.preventPospone set this to true to prevent the next periodical check to be posponed
*/

/**
 * Function to be called after a set operation. They are executed synchrony and they cannot modify the set.
 * @function afterSetHook
 * @param {object} event context in which the hook is executed
 * @param {string} event.url url of the resource that has received the set
 * @param {*} event.oldValue The previous value
 * @param {*} event.value The current value
 * @param {boolean} event.preventHooks set this to true, to prevent the next hooks to be executed.
 * @param {boolean} event.preventPospone Indicates the next periodical check has been posponed
*/

/**
 * Obtain the current value and is different, update the cache and call the handlers
 * @param {string} url of the resources to be refreshed
 * @param {boolean} force to ignore the threshold and force a refresh no matter how close it is from the previous check
 * @returns {boolean} False if there is nothing to refresh, true otherwise
 */
async function refresh (url, force = false) {
  const resource = resources[url];
  if (!resource) {
    return false
  }
  resource.clean = undefined;
  if (!force && resource.plugin.threshold !== undefined && Date.now() - resource.last < resource.plugin.threshold) {
    return
  }
  pospone(resource);
  resource.plugin.refresh(resource, async value => {
    await _set(resource, value);
  });
  return true
}

/**
 * Set a handler to be called each time the value of resource at the url changes
 * @param {string} url The resource to subscribe to
 * @param {handler} cb handler to be called
 * @param {object} options Optional parameters
 * @param {integer} options.interval seconds check for a change on the resorce's value, (if supported by the plugin)
 * @param {any} options.first first value to initiate the resorce with
 * @return {function} unsubscribe function
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
  if (Date.now() - resource.last > resource.plugin.threshold) {
    refresh(url);
  }
  return unsubscribe
}

/**
 * @callback handler
 * @param {object} resource at the url
*/

/**
 * Attach a handler to change in an resource that will be executed at most once.
 *
 * @param {string} url
 * @param {onceHandler} handler
 * @returns
 */
function once (url, handler) {
  const unsubscribe = onGet(url, value => {
    unsubscribe();
    handler(value, url);
  });
  return unsubscribe
}

/**
 * @callback onceHandler
 * @param {any} value
 * @param {string} url of the resource whose value has change
 */

/**
 * call refresh on every resource that matches the regular expression
 * @param {RegExp} regex to test the resources
 * @param {boolean} force to pass to refresh
 */
function refreshRegExp (regex, force) {
  Object.values(resources).forEach(resource => {
    if (regex.test(resource.url)) {
      refresh(resource.url, force);
    }
  });
}

/**
 * Registers a plugin. Plugins are checked last registered first checked.
 * @param {object} plugin Plugin object to register
 * @param {string} plugin.name Name of the plugin, not really used
 * @param {RegExp} plugin.regex Regex to match the resource's url
 * @param {number} plugin.checkInterval amount of milliseconds to call refresh,
 * @param {number} plugin.threshold amount of milliseconds in which a subsequent call to get, or onGet, uses the cached value instead of calling refresh
 * @param {function} plugin.refresh function that is called to obtain the value
 * @returns {undefined} undefined
 */
function registerPlugin (plugin) {
  plugins.unshift(plugin);
}

/**
 * Internal
 *
 * @return {object} serializable with the minimun data to restore the resources
 */
function savedresources () {
  const saved = {};
  Object.values(resources).forEach(resource => {
    const savedresource = {
      value: resource.value
    };

    if (resource.plugin.saveresource) {
      resource.plugin.saveresource(resource.url, savedresource);
    }

    if (!savedresource.preventSave) {
      saved[resource.url] = savedresource;
    }
  });
  return saved
}

/** Internal
 *
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
 * @return {object} an object that represents the current state of the application, and that can be serialized
 */
function save () {
  return {
    resources: savedresources(),
    plugins: savedPlugins()
  }
}

const promises = [];
const resolves = [];
async function start () {
  promises.unshift(new Promise(resolve => resolves.unshift(resolve)));
  await promises[1];
  plugins.forEach(plugin => {
    if (plugin.start) {
      plugin.start();
    }
  });
}

function end () {
  plugins.forEach(plugin => {
    if (plugin.end) {
      plugin.end();
    }
  });

  promises.pop();
  const resolve = resolves.pop();
  resolve();
}

/**
 * React hook that reload the component when the url's state change
 * @param {*} url the url to subscribe to
 * @param {*} first the first value to use, before the real one arrives
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

const plugin = {
  name: 'fetch',
  regex: /^./,
  checkInterval: 30000,
  threshold: 500,
  async refresh (resource, eventHandler) {
    const response = await fetch(resource.url).catch(__error => ({ __error }));
    if (response.__error) {
      return eventHandler(response.__error)
    }
    const raw = await response.text();
    let value;
    try {
      value = JSON.parse(raw);
    } catch (e) {
      value = raw;
    }
    eventHandler(value);
  },
  start () {
    plugin.checkInterval = undefined;
    plugin.threshold = undefined;
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

const plugin$1 = {
  name: 'localStorage',
  regex: /^localStorage:\/\/./i,
  refresh (resource, eventHandler) {
    eventHandler(parseIfPossible(localStorage[resource.key]));
  },
  getResource (resource) {
    resource.unsubscribeStorage = onChange(resource);
    resource.key = resource.url.substr(PROTOCOLCUT);

    if (localStorage[resource.key] !== undefined) {
      resource.value = parseIfPossible(localStorage[resource.key]);
      return
    }
    localStorage[resource.key] = JSON.stringify(resource.value);
  },
  get (url) {
    return parseIfPossible(localStorage[url.substr(PROTOCOLCUT)])
  },
  set (resource) {
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

const plugin$2 = {
  name: 'sessionStorage',
  regex: /^sessionStorage:\/\/./i,
  refresh (resource, eventHandler) {
    eventHandler(parseIfPossible$1(sessionStorage[resource.key]));
  },
  getResource (resource) {
    resource.key = resource.url.substr(PROTOCOLCUT$1);

    if (sessionStorage[resource.key] !== undefined) {
      resource.value = parseIfPossible$1(sessionStorage[resource.key]);
      return
    }
    sessionStorage[resource.key] = JSON.stringify(resource.value);
  },
  get (url) {
    return parseIfPossible$1(sessionStorage[url.substr(PROTOCOLCUT$1)])
  },
  set (resource) {
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
  if (command && url === 'history://' && plugin$3.commands[command]) {
    Object.keys(state).forEach(url => plugin$3.commands[command](url, ...params));
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

const plugin$3 = {
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

  saveresource (url, savedresource) {
    savedresource.preventSave = true;
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
      plugin$3.commands.undo(url, Infinity);
    },
    last (url) {
      plugin$3.commands.redo(url, Infinity);
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
  name: 'state',
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

  saveresource (url, savedresource) {
    savedresource.preventSave = true;
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

registerPlugin(plugin);
registerPlugin(plugin$1);
registerPlugin(plugin$2);
registerPlugin(plugin$3);
registerPlugin(dotted);

exports.afterSet = afterSet;
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
