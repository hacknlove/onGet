import { isDifferent } from 'isdifferent';
import pathToRegExp from 'path-to-regexp';
import { useState, useEffect } from 'react';
import { getValue, setValue, deleteValue } from '@hacknlove/deepobject';

const conf = {
  CACHE_SIZE: 100
};
const endpoints = {};
const plugins = [];
const setHooks = {
  before: [],
  after: []
};

/**
 * Internal: Returns the first plugin whose regex matchs the url
 * @param {string} url endpoint's url
 * @return plugin object
 */
function findPlugin (url) {
  return plugins.find(plugin => url.match(plugin.regex))
}

/**
 * Cleans unused endpoints. The ones that has no callbacks, no method called recently.
 * It is  intended to be called each time a new endpoint is created
 */
function clean () {
  const values = Object.values(endpoints);

  if (values.length < conf.CACHE_SIZE) {
    return
  }

  values.forEach(endpoint => {
    if (!endpoint.clean) {
      if (Object.keys(endpoint.callbacks).length === 0) {
        endpoint.clean = true;
      }
      return
    }
    if (endpoint.plugin.clean && endpoint.plugin.clean(endpoint)) {
      return
    }
    clearTimeout(endpoints[endpoint.url].timeout);
    delete endpoints[endpoint.url];
  });
}

/**
 * Creates if needed and returns the object that stores the callbacks, configuration and state of an endpoint
 * @param {string} url endpoint's url
 * @params {any} [firstValue] is used as a firstValue, before any action was performed by the plugin
 * @returns {object} the endpoint
 */
function getEndpoint (url, firstValue) {
  if (endpoints[url]) {
    return endpoints[url]
  }
  setTimeout(clean);
  const plugin = findPlugin(url);
  if (!plugin) {
    throw new Error(`No plugin for ${url}`)
  }
  const endpoint = {
    url,
    plugin,
    value: firstValue,
    callbacks: {}
  };
  endpoints[url] = endpoint;

  if (plugin.checkInterval) {
    endpoint.intervals = {};
    endpoint.minInterval = Infinity;
  }

  if (plugin.threshold !== undefined) {
    endpoint.last = -Infinity;
  }

  if (plugin.getEndpoint) {
    plugin.getEndpoint(endpoint);
  }

  return endpoint
}

/**
 * Function factory that creats and returns unsubscribe functions
 * @param {object} endpoint from which unsubscribe
 * @param {strink} sk key that identifies the subscription
 */
function createUnsubscribe (endpoint, sk) {
  return () => {
    if (!endpoint.callbacks.hasOwnProperty(sk)) {
      return
    }

    delete endpoint.callbacks[sk];
    if (endpoint.intervals) {
      delete endpoint.intervals[sk];
      endpoint.minInterval = Math.min(...Object.values(endpoint.intervals));
    }
  }
}

/**
 * Adds the callback to the endpoint, updates the min interval configuration, and returns the unsubscribe function
 * @param {string} url endpoint's url
 * @param {function} callback it will be called each time the value of the endpoint changes
 * @param {number} [interval] max interval (milliseconds) to check for a new value
 * @return {function} unsubscribe function
 */
function addNewSubscription (url, callback, interval) {
  const endpoint = endpoints[url];

  var sk;
  do {
    sk = Math.random().toString(36).substr(2) + (Date.now() % 1000).toString(36);
  } while (endpoint.callbacks[sk])
  endpoint.callbacks[sk] = callback;

  if (endpoint.intervals) {
    interval = interval || endpoint.plugin.checkInterval;
    endpoint.intervals[sk] = interval;
    endpoint.minInterval = Math.min(endpoint.minInterval, interval);
  }

  return createUnsubscribe(endpoint, sk)
}

/**
 * Pospone the refresh of the endpoint
 * @param {object} endpoint endpoint whose refresh should be posponed, as returned by getEndpoint(url)
 * @returns undefined
 */
function pospone (endpoint) {
  if (!endpoint.intervals) {
    return
  }
  clearTimeout(endpoint.timeout);
  if (!endpoints[endpoint.url]) {
    return
  }
  endpoint.last = Date.now();
  endpoint.timeout = setTimeout(() => {
    refresh(endpoint.url);
  }, endpoint.minInterval);
}

/**
 * set a new cached value for an endpoint, and call the handlers. If the endpoint does not exists, it creates it.
 * @param {string} url  of the endpoint whose value set to
 * @param {any} value value to series
 * @param {boolean} doPospone=true if false do not pospone the closest refresh
 * @return {object} endpoint
 */

async function set (url, value, doPospone) {
  const beforeResult = await executeHooks(url, value, setHooks.before, doPospone);
  if (beforeResult.preventSet) {
    return
  }
  value = beforeResult.value;
  doPospone = beforeResult.doPospone;

  const endpoint = endpoints[url];
  if (!endpoint) {
    const endpoint = getEndpoint(url, value);
    if (endpoint.plugin.set) {
      endpoint.value = value;
      endpoint.plugin.set(endpoint);
    }
    return executeHooks(url, value, setHooks.after, doPospone)
  }

  endpoint.clean = undefined;
  if (endpoint.intervals && doPospone) {
    pospone(endpoint);
  }
  if (!isDifferent(value, endpoint.value)) {
    return executeHooks(url, value, setHooks.after, doPospone)
  }

  endpoint.value = value;
  if (endpoint.plugin.set) {
    endpoint.plugin.set(endpoint);
  }
  if (!beforeResult.preventRefresh) {
    Object.values(endpoint.callbacks).forEach(cb => cb(endpoint.value));
  }
  return executeHooks(url, value, setHooks.after, doPospone)
}

async function executeHooks (url, value, where, doPospone) {
  const event = {
    doPospone,
    url,
    value,
    preventSet: false,
    preventRefresh: false,
    preventMoreHooks: false,
    redirect (newUrl) {
      event.preventMoreHooks = true;
      event.preventSet = true;
      set(newUrl, event.value, where);
    }
  };

  for (let i = 0, z = where.length; i < z; i++) {
    if (event.preventMoreHooks) {
      break
    }
    const [regex, keys, cb] = where[i];
    const match = url.match(regex);
    if (!match) {
      continue
    }
    event.params = {};
    for (let i = 1; i < match.length; i++) {
      event.params[keys[i - 1].name] = match[1];
    }

    await cb(event);
  }

  return event
}

function insertHook (path, hook, where) {
  const keys = [];
  const regex = pathToRegExp(path);
  where.push([regex, keys, hook]);
}

async function beforeSet (path, hook) {
  insertHook(path, hook, setHooks.before);
}

async function afterSet (path, hook) {
  insertHook(path, hook, setHooks.after);
}

/**
 * Obtain the current value and is different, update the cache and call the handlers
 * @param {string} url of the endpoints to be refreshed
 * @param {boolean} force to ignore the threshold and force a refresh no matter how close it is from the previous check
 * @returns {boolean} False if there is nothing to refresh, true otherwise
 */
async function refresh (url, force = false) {
  const endpoint = endpoints[url];
  if (!endpoint) {
    return false
  }
  endpoint.clean = undefined;
  if (!force && endpoint.plugin.threshold !== undefined && Date.now() - endpoint.last < endpoint.plugin.threshold) {
    return
  }
  pospone(endpoint);
  endpoint.plugin.refresh(endpoint, async value => {
    await set(url, value);
  });
  return true
}

/**
 * Set a handler to be called each time the value of the url changes
 * @param {string} url The value to subscribe to
 * @param {function} cb handler to be called
 * @param {object} options Optional parameters
 * @param {integer} options.interval seconds to refresh the value
 * @param {any} options.first first value to pass to the plugin
 */
function onGet (url, cb, options = {}) {
  const {
    first,
    interval
  } = options;
  const endpoint = getEndpoint(url, first);

  const unsubscribe = addNewSubscription(url, cb, interval);
  endpoint.clean = undefined;

  if (endpoint.value !== undefined) {
    cb(endpoint.value);
  }
  if (Date.now() - endpoint.last > endpoint.plugin.threshold) {
    refresh(url);
  }
  return unsubscribe
}

/**
 * Returns the cached value for the endpoint
 * @param {string} url url of the endpoint
 * @param {boolean} onlyCached=true, set to false to force the plugin to obtain a value if none if cached
 * @returns {any} whatever value is cached, or undefined, (or the obtained value if onlyCached = false)
 */
function get (url) {
  const endpoint = endpoints[url];
  if (endpoint) {
    endpoint.clean = undefined;
    return endpoints[url].value
  }
  const plugin = findPlugin(url);
  if (!plugin.get) {
    return undefined
  }
  return plugin.get(url)
}

/**
 * React hook that reload the component when the url's state change
 * @param {*} url the url to subscribe to
 * @param {*} first the first value to use, before the real one arrives
 */
function useOnGet (url, options = {}) {
  let [value, set] = useState(() => get(url) || options.first);

  if (options.firstIfUrlChanges) {
    value = get(url) || options.first;
  }

  useEffect(() => {
    return onGet(url, set, options)
  }, [url]);

  return value
}

function once (url, cb) {
  const unsubscribe = onGet(url, value => {
    unsubscribe();
    cb(value, url);
  });
  return unsubscribe
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

function command (url, command, ...params) {
  const endpoint = endpoints[url] || {
    plugin: findPlugin(url)
  };

  if (!endpoint.plugin.commands) {
    console.warn('the plugin does not accept commands');
    return
  }

  if (!endpoint.plugin.commands[command]) {
    console.warn('command not found');
    return
  }

  return endpoint.plugin.commands[command](url, ...params)
}

/**
 * Registers a plugin. Plugins are checked last registered first checked.
 * @param {object} plugin Plugin object to register
 * @param {string} plugin.name Name of the plugin, not really used
 * @param {RegExp} plugin.regex Regex to match the endpoint's url
 * @param {number} plugin.checkInterval amount of milliseconds to call refresh,
 * @param {number} plugin.threshold amount of millisecons in which a subsecuent call to get, or onGet, uses the cached value instead of calling refresh
 * @param {function} plugin.refresh function that is called to obtain the value
 * @returns {undefined} undefined
 */
function registerPlugin (plugin) {
  plugins.unshift(plugin);
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

/* global fetch */

const plugin = {
  name: 'fetch',
  regex: /^./,
  checkInterval: 30000,
  threshold: 500,
  async refresh (endpoint, eventHandler) {
    const response = await fetch(endpoint.url).catch(__error => ({ __error }));
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

const plugin$1 = {
  name: 'localStorage',
  regex: /^localStorage:\/\/./i,
  checkInterval: 30000,
  threshold: 500,
  refresh (endpoint, eventHandler) {
    eventHandler(parseIfPossible(localStorage[endpoint.key]));
  },
  getEndpoint (endpoint) {
    endpoint.key = endpoint.url.substr(PROTOCOLCUT);

    if (localStorage[endpoint.key] !== undefined) {
      endpoint.value = parseIfPossible(localStorage[endpoint.key]);
      return
    }
    localStorage[endpoint.key] = JSON.stringify(endpoint.value);
  },
  get (url) {
    return parseIfPossible(localStorage[url.substr(PROTOCOLCUT)])
  },
  set (endpoint) {
    localStorage[endpoint.key] = JSON.stringify(endpoint.value);
  },

  start () {
    plugin$1.checkInterval = 0;
    plugin$1.threshold = undefined;
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
  checkInterval: 30000,
  threshold: 500,
  refresh (endpoint, eventHandler) {
    eventHandler(parseIfPossible$1(sessionStorage[endpoint.key]));
  },
  getEndpoint (endpoint) {
    endpoint.key = endpoint.url.substr(PROTOCOLCUT$1);

    if (sessionStorage[endpoint.key] !== undefined) {
      endpoint.value = parseIfPossible$1(sessionStorage[endpoint.key]);
      return
    }
    sessionStorage[endpoint.key] = JSON.stringify(endpoint.value);
  },
  get (url) {
    return parseIfPossible$1(sessionStorage[url.substr(PROTOCOLCUT$1)])
  },
  set (endpoint) {
    sessionStorage[endpoint.key] = JSON.stringify(endpoint.value);
  },

  start () {
    plugin$2.checkInterval = 0;
    plugin$2.threshold = undefined;
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
  Object.values(endpoints).forEach(endpoint => {
    if (!endpoint.relative) {
      return
    }
    if (!endpoint.url.startsWith(prefix)) {
      return
    }
    const newValue = getRelativeValue(endpoint.relative.url, endpoint.relative.n);
    if (isDifferent(newValue, endpoint.value)) {
      endpoint.value = newValue;
      executeCallbacks(endpoint.url);
    }
  });
}

function executeCallbacks (url) {
  const endpoint = endpoints[url];
  if (!endpoint) {
    return
  }
  Object.values(endpoint.callbacks).forEach(cb => cb(endpoint.value));
}

function updateEndpoint (url) {
  const endpoint = endpoints[url];
  if (!endpoint) {
    return
  }
  const history = state[url];
  endpoint.value = history.history[history.cursor];
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
   * If the state has not value for this endpoint.url, creates a new updated state
   * else, set endpoint.value according to the state
   * @param {object} endpoint
   */
  getEndpoint (endpoint) {
    const relative = endpoint.url.match(/(.*)#(-?\d+)$/);

    if (!relative) {
      state[endpoint.url] = {
        history: [endpoint.value],
        cursor: 0
      };
      return
    }

    endpoint.relative = {
      url: relative[1],
      n: relative[2] * 1
    };

    endpoint.value = getRelativeValue(relative[1], relative[2] * 1);
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
   * Updates the endpoint.value, and propagates up and down
   * @params {object} endpoint
   * @returns {undefined}
   */
  set (endpoint) {
    const relative = endpoint.relative;

    if (!relative) {
      const history = state[endpoint.url];
      if (!isDifferent(endpoint.value, history.history[history.cursor])) {
        return
      }
      if (history.cursor < history.history.length - 1) {
        history.history.splice(history.cursor + 1);
      }
      history.history.push(endpoint.value);
      history.cursor++;
      propagate(endpoint.url);
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

    history.history[absolute] = endpoint.value;
  },

  /**
   * Removes the history
   * @param {object} endpoint
   * @returns {undefined}
   */
  clean (endpoint) {
    const url = endpoint.url.replace(/#-?\d+$/, '');
    if (!state[endpoint.url]) {
      return
    }

    if (endpoints[url] && !endpoints[url].clean) {
      return
    }

    if (Object.values(endpoints).some(endpoint => {
      if (endpoint.clean) {
        return false
      }
      if (!endpoint.relative) {
        return false
      }
      if (endpoint.relative.url !== url) {
        return false
      }
      return true
    })) {
      return
    }
    delete state[endpoint.url];
  },

  start () {
    state = {};
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

      updateEndpoint(url);
      propagate(url);
    },
    undo (url, n = 1) {
      n = Math.floor(n * 1);
      const history = cleanUrlAndGetHistory(url, 'undo', n);
      if (!history) {
        return
      }
      history.cursor = Math.max(0, history.cursor - n);
      updateEndpoint(url);
      propagate(url);
    },
    redo (url, n = 1) {
      n = Math.floor(n * 1);
      const history = cleanUrlAndGetHistory(url, 'redo', n);
      if (!history) {
        return
      }
      history.cursor = Math.min(history.cursor + n, history.history.length - 1);
      updateEndpoint(url);
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
      updateEndpoint(url);
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
 * For each endpoint whose url is a parent of url, update his value and call his callbacks
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
  const endpoint = endpoints[parentUrl];

  if (endpoint) {
    endpoint.value = getValue(state$1, endpoint.url);
    Object.values(endpoint.callbacks).forEach(cb => cb(endpoint.value));
  }
  propagateUp(parentUrl);
}

/**
 * For each endpoint whose url is a child of url, if his value has changed, update it and call his callbacks
 *
 * dotted://foo.bar.buz is a parent of dotted://foo.bar
 * @param {string} url
 * @returns {undefined}
 */
function propagateDown (url) {
  const parent = endpoints[url];
  const prefix = `${url}.`;
  Object.keys(endpoints).forEach(childUrl => {
    if (!childUrl.startsWith(prefix)) {
      return
    }
    const child = endpoints[childUrl];
    const newChildValue = getValue(parent.value, childUrl.substr(url.length + 1));

    if (isDifferent(newChildValue, child.value)) {
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
   * If the state has not value for this endpoint.url, creates a new updated state
   * else, set endpoint.value according to the state
   * @param {object} endpoint
   */
  getEndpoint (endpoint) {
    const actualValue = getValue(state$1, endpoint.url);
    if (actualValue === undefined) {
      state$1 = setValue(state$1, endpoint.url, endpoint.value);
      propagateUp(endpoint.url);
      propagateDown(endpoint.url);
      return
    }
    endpoint.value = actualValue;
  },

  /**
   * Returns the value at the state
   * @param {string} url
   * @returns {object} the value
   */
  get (url) {
    return getValue(state$1, url)
  },

  /**
   * Updates the endpoint.value, and propagates up and down
   * @params {object} endpoint
   * @returns {undefined}
   */
  set (endpoint) {
    state$1 = setValue(state$1, endpoint.url, endpoint.value);
    propagateUp(endpoint.url);
    propagateDown(endpoint.url);
  },

  /**
   * If there is no children endpoint, delete the value, and propagate up
   * @param {object} endpoint
   * @returns {undefined}
   */
  clean (endpoint) {
    const prefix = `${endpoint.url}.`;
    if (Object.keys(endpoints).some(url => url.startsWith(prefix))) {
      return
    }
    propagateUp(endpoint.url);
  },

  start () {
    state$1 = {};
  },

  commands: {
    remove (url) {
      state$1 = deleteValue(state$1, url);
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

export { afterSet, beforeSet, command, conf, end, endpoints, get, onGet, once, plugins, refresh, registerPlugin, set, start, useOnGet, waitUntil };
