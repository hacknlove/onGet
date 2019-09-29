'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var isDifferent = _interopDefault(require('isdifferent'));
var react = require('react');
var deepobject = require('@hacknlove/deepobject');

const conf = {
  CACHE_SIZE: 100
};
const endpoints = {};
const plugins = [];

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

function set (url, value, doPospone) {
  const endpoint = endpoints[url];

  if (!endpoint) {
    const endpoint = getEndpoint(url, value);
    if (endpoint.plugin.set) {
      endpoint.value = value;
      endpoint.plugin.set(endpoint);
    }
    return
  }

  endpoint.clean = undefined;
  if (endpoint.intervals && doPospone) {
    pospone(endpoint);
  }
  if (!isDifferent(value, endpoint.value)) {
    return
  }

  endpoint.value = value;
  if (endpoint.plugin.set) {
    endpoint.plugin.set(endpoint);
  }

  Object.values(endpoint.callbacks).forEach(cb => setTimeout(cb, 0, endpoint.value));
}

/**
 * Obtain the current value and is different, update the cache and call the handlers
 * @param {string} url of the endpoints to be refreshed
 * @returns {boolean} False if there is nothing to refresh, true otherwise
 */
function refresh (url) {
  const endpoint = endpoints[url];
  if (!endpoint) {
    return false
  }
  endpoint.clean = undefined;
  if (endpoint.plugin.threshold !== undefined && Date.now() - endpoint.last < endpoint.plugin.threshold) {
    return
  }
  pospone(endpoint);
  endpoint.plugin.refresh(endpoint, value => {
    set(url, value);
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
function useOnGet (url, options) {
  const [value, set] = react.useState(() => get(url) || options.first);

  react.useEffect(() => {
    return onGet(url, set, options)
  }, [url]);

  return value
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

/* global fetch */

const plugin = {
  name: 'fetch',
  regex: /^./,
  checkInterval: 30000,
  threshold: 500,
  refresh (endpoint, eventHandler) {
    return fetch(endpoint.url)
      .then(response => {
        response.json()
          .then(eventHandler)
          .catch(() => {
            response.text()
              .then(eventHandler)
              .catch(eventHandler);
          });
      })
      .catch(eventHandler)
  }
};

/* global localStorage */
const PROTOCOLCUT = 'localStorage://'.length;

var localStorage$1 = {
  name: 'localStorage',
  regex: /^localStorage:\/\/./i,
  checkInterval: 30000,
  threshold: 500,
  refresh (endpoint, eventHandler) {
    eventHandler(localStorage[endpoint.key]);
  },
  getEndpoint (endpoint) {
    endpoint.key = endpoint.url.substr(PROTOCOLCUT);

    if (localStorage[endpoint.key] !== undefined) {
      endpoint.value = localStorage[endpoint.key];
      return
    }
    localStorage[endpoint.key] = endpoint.value;
  },
  get (url) {
    return localStorage[url.substr(PROTOCOLCUT)]
  },
  set (endpoint) {
    localStorage[endpoint.key] = endpoint.value;
  }
};

/* global sessionStorage */
const PROTOCOLCUT$1 = 'sessionStorage://'.length;

var sessionStorate = {
  name: 'sessionStorage',
  regex: /^sessionStorage:\/\/./i,
  checkInterval: 30000,
  threshold: 500,
  refresh (endpoint, eventHandler) {
    eventHandler(sessionStorage[endpoint.key]);
  },
  getEndpoint (endpoint) {
    endpoint.key = endpoint.url.substr(PROTOCOLCUT$1);

    if (sessionStorage[endpoint.key] !== undefined) {
      endpoint.value = sessionStorage[endpoint.key];
      return
    }
    sessionStorage[endpoint.key] = endpoint.value;
  },
  get (url) {
    return sessionStorage[url.substr(PROTOCOLCUT$1)]
  },
  set (endpoint) {
    sessionStorage[endpoint.key] = endpoint.value;
  }
};

var state = {};

/**
 * For each endpoint whose url is a parent of url, update his value and call his callbacks
 *
 * state://foo.bar is a parent of state://foo.bar.buz
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
    endpoint.value = deepobject.getValue(state, endpoint.url);
    Object.values(endpoint.callbacks).forEach(cb => setTimeout(cb, 0, endpoint.value));
  }
  setTimeout(propagateUp, 0, parentUrl);
}

/**
 * For each endpoint whose url is a child of url, if his value has changed, update it and call his callbacks
 *
 * state://foo.bar.buz is a parent of state://foo.bar
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
    const newChildValue = deepobject.getValue(parent.value, childUrl.substr(url.length + 1));

    if (isDifferent(newChildValue, child.value)) {
      child.value = newChildValue;
      Object.values(child.callbacks).forEach(cb => setTimeout(cb, 0, newChildValue));
    }
  });
}

var state$1 = {
  name: 'state',
  regex: /^state:\/\/./,

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
    const actualValue = deepobject.getValue(state, endpoint.url);
    if (actualValue === undefined) {
      state = deepobject.setValue(state, endpoint.url, endpoint.value);
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
    return deepobject.getValue(state, url)
  },

  /**
   * Updates the endpoint.value, and propagates up and down
   * @params {object} endpoint
   * @returns {undefined}
   */
  set (endpoint) {
    state = deepobject.setValue(state, endpoint.url, endpoint.value);
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
  }
};

registerPlugin(plugin);
registerPlugin(localStorage$1);
registerPlugin(sessionStorate);
registerPlugin(state$1);

exports.conf = conf;
exports.endpoints = endpoints;
exports.get = get;
exports.onGet = onGet;
exports.plugins = plugins;
exports.refresh = refresh;
exports.registerPlugin = registerPlugin;
exports.set = set;
exports.useOnGet = useOnGet;
