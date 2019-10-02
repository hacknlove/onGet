(function (global, factory) {
typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('isdifferent'), require('react'), require('@hacknlove/deepobject')) :
typeof define === 'function' && define.amd ? define(['exports', 'isdifferent', 'react', '@hacknlove/deepobject'], factory) :
(global = global || self, factory(global.onGet = {}, global.isDifferent, global.React, global.deepObject));
}(this, function (exports, isDifferent, react, deepobject) { 'use strict';

isDifferent = isDifferent && isDifferent.hasOwnProperty('default') ? isDifferent['default'] : isDifferent;

var conf = {
  CACHE_SIZE: 100
};
var endpoints = {};
var plugins = [];

/**
 * Internal: Returns the first plugin whose regex matchs the url
 * @param {string} url endpoint's url
 * @return plugin object
 */

function findPlugin(url) {
  return plugins.find(function (plugin) {
    return url.match(plugin.regex);
  });
}

/**
 * Cleans unused endpoints. The ones that has no callbacks, no method called recently.
 * It is  intended to be called each time a new endpoint is created
 */

function clean() {
  var values = Object.values(endpoints);

  if (values.length < conf.CACHE_SIZE) {
    return;
  }

  values.forEach(function (endpoint) {
    if (!endpoint.clean) {
      if (Object.keys(endpoint.callbacks).length === 0) {
        endpoint.clean = true;
      }

      return;
    }

    if (endpoint.plugin.clean && endpoint.plugin.clean(endpoint)) {
      return;
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

function getEndpoint(url, firstValue) {
  if (endpoints[url]) {
    return endpoints[url];
  }

  setTimeout(clean);
  var plugin = findPlugin(url);

  if (!plugin) {
    throw new Error("No plugin for " + url);
  }

  var endpoint = {
    url: url,
    plugin: plugin,
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

  return endpoint;
}

/**
 * Function factory that creats and returns unsubscribe functions
 * @param {object} endpoint from which unsubscribe
 * @param {strink} sk key that identifies the subscription
 */
function createUnsubscribe(endpoint, sk) {
  return function () {
    if (!endpoint.callbacks.hasOwnProperty(sk)) {
      return;
    }

    delete endpoint.callbacks[sk];

    if (endpoint.intervals) {
      delete endpoint.intervals[sk];
      endpoint.minInterval = Math.min.apply(Math, Object.values(endpoint.intervals));
    }
  };
}

/**
 * Adds the callback to the endpoint, updates the min interval configuration, and returns the unsubscribe function
 * @param {string} url endpoint's url
 * @param {function} callback it will be called each time the value of the endpoint changes
 * @param {number} [interval] max interval (milliseconds) to check for a new value
 * @return {function} unsubscribe function
 */

function addNewSubscription(url, callback, interval) {
  var endpoint = endpoints[url];
  var sk;

  do {
    sk = Math.random().toString(36).substr(2) + (Date.now() % 1000).toString(36);
  } while (endpoint.callbacks[sk]);

  endpoint.callbacks[sk] = callback;

  if (endpoint.intervals) {
    interval = interval || endpoint.plugin.checkInterval;
    endpoint.intervals[sk] = interval;
    endpoint.minInterval = Math.min(endpoint.minInterval, interval);
  }

  return createUnsubscribe(endpoint, sk);
}

/**
 * Pospone the refresh of the endpoint
 * @param {object} endpoint endpoint whose refresh should be posponed, as returned by getEndpoint(url)
 * @returns undefined
 */

function pospone(endpoint) {
  if (!endpoint.intervals) {
    return;
  }

  clearTimeout(endpoint.timeout);

  if (!endpoints[endpoint.url]) {
    return;
  }

  endpoint.last = Date.now();
  endpoint.timeout = setTimeout(function () {
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

function set(url, value, doPospone) {
  var endpoint = endpoints[url];

  if (!endpoint) {
    var _endpoint = getEndpoint(url, value);

    if (_endpoint.plugin.set) {
      _endpoint.value = value;

      _endpoint.plugin.set(_endpoint);
    }

    return;
  }

  endpoint.clean = undefined;

  if (endpoint.intervals && doPospone) {
    pospone(endpoint);
  }

  if (!isDifferent(value, endpoint.value)) {
    return;
  }

  endpoint.value = value;

  if (endpoint.plugin.set) {
    endpoint.plugin.set(endpoint);
  }

  Object.values(endpoint.callbacks).forEach(function (cb) {
    return setTimeout(cb, 0, endpoint.value);
  });
}

/**
 * Obtain the current value and is different, update the cache and call the handlers
 * @param {string} url of the endpoints to be refreshed
 * @param {boolean} force to ignore the threshold and force a refresh no matter how close it is from the previous check
 * @returns {boolean} False if there is nothing to refresh, true otherwise
 */

function refresh(url, force) {
  if (force === void 0) {
    force = false;
  }

  var endpoint = endpoints[url];

  if (!endpoint) {
    return false;
  }

  endpoint.clean = undefined;

  if (!force && endpoint.plugin.threshold !== undefined && Date.now() - endpoint.last < endpoint.plugin.threshold) {
    return;
  }

  pospone(endpoint);
  endpoint.plugin.refresh(endpoint, function (value) {
    set(url, value);
  });
  return true;
}

/**
 * Set a handler to be called each time the value of the url changes
 * @param {string} url The value to subscribe to
 * @param {function} cb handler to be called
 * @param {object} options Optional parameters
 * @param {integer} options.interval seconds to refresh the value
 * @param {any} options.first first value to pass to the plugin
 */

function onGet(url, cb, options) {
  if (options === void 0) {
    options = {};
  }

  var _options = options,
      first = _options.first,
      interval = _options.interval;
  var endpoint = getEndpoint(url, first);
  var unsubscribe = addNewSubscription(url, cb, interval);
  endpoint.clean = undefined;

  if (endpoint.value !== undefined) {
    cb(endpoint.value);
  }

  if (Date.now() - endpoint.last > endpoint.plugin.threshold) {
    refresh(url);
  }

  return unsubscribe;
}

/**
 * Returns the cached value for the endpoint
 * @param {string} url url of the endpoint
 * @param {boolean} onlyCached=true, set to false to force the plugin to obtain a value if none if cached
 * @returns {any} whatever value is cached, or undefined, (or the obtained value if onlyCached = false)
 */

function get(url) {
  var endpoint = endpoints[url];

  if (endpoint) {
    endpoint.clean = undefined;
    return endpoints[url].value;
  }

  var plugin = findPlugin(url);

  if (!plugin.get) {
    return undefined;
  }

  return plugin.get(url);
}

/**
 * React hook that reload the component when the url's state change
 * @param {*} url the url to subscribe to
 * @param {*} first the first value to use, before the real one arrives
 */

function useOnGet(url, options) {
  if (options === void 0) {
    options = {};
  }

  var _useState = react.useState(function () {
    return get(url) || options.first;
  }),
      value = _useState[0],
      set = _useState[1];

  react.useEffect(function () {
    return onGet(url, set, options);
  }, [url]);
  return value;
}

function command(url, command) {
  var _endpoint$plugin$comm;

  var endpoint = endpoints[url] || {
    plugin: findPlugin(url)
  };

  if (!endpoint.plugin.commands) {
    console.warn('the plugin does not accept commands');
    return;
  }

  if (!endpoint.plugin.commands[command]) {
    console.warn('command not found');
    return;
  }

  for (var _len = arguments.length, params = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    params[_key - 2] = arguments[_key];
  }

  return (_endpoint$plugin$comm = endpoint.plugin.commands)[command].apply(_endpoint$plugin$comm, [url].concat(params));
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

function registerPlugin(plugin) {
  plugins.unshift(plugin);
}

/* global fetch */
var plugin = {
  name: 'fetch',
  regex: /^./,
  checkInterval: 30000,
  threshold: 500,
  refresh: function refresh(endpoint, eventHandler) {
    return fetch(endpoint.url).then(function (response) {
      response.json().then(eventHandler).catch(function () {
        response.text().then(eventHandler).catch(eventHandler);
      });
    }).catch(eventHandler);
  }
};

/* global localStorage */
var PROTOCOLCUT = 'localStorage://'.length;
var localStorage$1 = {
  name: 'localStorage',
  regex: /^localStorage:\/\/./i,
  checkInterval: 30000,
  threshold: 500,
  refresh: function refresh(endpoint, eventHandler) {
    eventHandler(localStorage[endpoint.key]);
  },
  getEndpoint: function getEndpoint(endpoint) {
    endpoint.key = endpoint.url.substr(PROTOCOLCUT);

    if (localStorage[endpoint.key] !== undefined) {
      endpoint.value = localStorage[endpoint.key];
      return;
    }

    localStorage[endpoint.key] = endpoint.value;
  },
  get: function get(url) {
    return localStorage[url.substr(PROTOCOLCUT)];
  },
  set: function set(endpoint) {
    localStorage[endpoint.key] = endpoint.value;
  }
};

/* global sessionStorage */
var PROTOCOLCUT$1 = 'sessionStorage://'.length;
var sessionStorate = {
  name: 'sessionStorage',
  regex: /^sessionStorage:\/\/./i,
  checkInterval: 30000,
  threshold: 500,
  refresh: function refresh(endpoint, eventHandler) {
    eventHandler(sessionStorage[endpoint.key]);
  },
  getEndpoint: function getEndpoint(endpoint) {
    endpoint.key = endpoint.url.substr(PROTOCOLCUT$1);

    if (sessionStorage[endpoint.key] !== undefined) {
      endpoint.value = sessionStorage[endpoint.key];
      return;
    }

    sessionStorage[endpoint.key] = endpoint.value;
  },
  get: function get(url) {
    return sessionStorage[url.substr(PROTOCOLCUT$1)];
  },
  set: function set(endpoint) {
    sessionStorage[endpoint.key] = endpoint.value;
  }
};

var state = {};
function cleanUrlAndGetHistory(url, command) {
  for (var _len = arguments.length, params = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    params[_key - 2] = arguments[_key];
  }

  var history = state[url.replace(/#-?\d+$/, '')];

  if (history) {
    return history;
  }

  if (command && url === 'history://' && plugin$1.commands[command]) {
    Object.keys(state).forEach(function (url) {
      var _plugin$commands;

      return (_plugin$commands = plugin$1.commands)[command].apply(_plugin$commands, [url].concat(params));
    });
  }
}
function getRelativeValue(url, n) {
  var history = state[url];

  if (!history) {
    return;
  }

  var absolute = history.cursor - n;

  if (absolute < 0) {
    return undefined;
  }

  if (absolute >= history.history.length) {
    return undefined;
  }

  return history.history[absolute];
}
function propagate(url) {
  var prefix = url + "#";
  Object.values(endpoints).forEach(function (endpoint) {
    if (!endpoint.relative) {
      return;
    }

    if (!endpoint.url.startsWith(prefix)) {
      return;
    }

    var newValue = getRelativeValue(endpoint.relative.url, endpoint.relative.n);

    if (isDifferent(newValue, endpoint.value)) {
      endpoint.value = newValue;
      executeCallbacks(endpoint.url);
    }
  });
}
function executeCallbacks(url) {
  var endpoint = endpoints[url];

  if (!endpoint) {
    return;
  }

  Object.values(endpoint.callbacks).forEach(function (cb) {
    return setTimeout(cb, 0, endpoint.value);
  });
}
function updateEndpoint(url) {
  var endpoint = endpoints[url];

  if (!endpoint) {
    return;
  }

  var history = state[url];
  endpoint.value = history.history[history.cursor];
  executeCallbacks(url);
}
var plugin$1 = {
  name: 'history',
  regex: /^history:\/\/./,

  /**
   * Nothing to refresh. shows a warning in the console
   * @returns {undefined}
   */
  refresh: function refresh() {
    console.warn('refresh does nothing with history:// plugin');
  },

  /**
   * If the state has not value for this endpoint.url, creates a new updated state
   * else, set endpoint.value according to the state
   * @param {object} endpoint
   */
  getEndpoint: function getEndpoint(endpoint) {
    var relative = endpoint.url.match(/(.*)#(-?\d+)$/);

    if (!relative) {
      state[endpoint.url] = {
        history: [endpoint.value],
        cursor: 0
      };
      return;
    }

    endpoint.relative = {
      url: relative[1],
      n: relative[2] * 1
    };
    endpoint.value = getRelativeValue(relative[1], relative[2] * 1);
  },
  get: function get(url) {
    if (state[url]) {
      return state[url].history[state[url].cursor];
    }

    var relative = url.match(/(.*)#(-?\d+)$/);

    if (!relative) {
      return;
    }

    return getRelativeValue(relative[1], relative[2] * 1);
  },

  /**
   * Updates the endpoint.value, and propagates up and down
   * @params {object} endpoint
   * @returns {undefined}
   */
  set: function set(endpoint) {
    var relative = endpoint.relative;

    if (!relative) {
      var _history = state[endpoint.url];

      if (!isDifferent(endpoint.value, _history.history[_history.cursor])) {
        return;
      }

      if (_history.cursor < _history.history.length) {
        _history.history.splice(_history.cursor + 1);
      }

      _history.history.push(endpoint.value);

      _history.cursor++;
      propagate(endpoint.url);
      return;
    }

    var history = state[relative.url];

    if (!history) {
      return;
    }

    var absolute = history.cursor - relative.n;

    if (absolute < 0) {
      return;
    }

    if (absolute >= history.history.length) {
      return;
    }

    history.history[absolute] = endpoint.value;
  },

  /**
   * Removes the history
   * @param {object} endpoint
   * @returns {undefined}
   */
  clean: function clean(endpoint) {
    var url = endpoint.url.replace(/#-?\d+$/, '');

    if (!state[endpoint.url]) {
      return;
    }

    if (endpoints[url] && !endpoints[url].clean) {
      return;
    }

    if (endpoints.some(function (endpoint) {
      if (endpoint.clean) {
        return false;
      }

      if (!endpoint.relative) {
        return false;
      }

      if (endpoint.relative.url !== url) {
        return false;
      }

      return true;
    })) {
      return;
    }

    delete state[endpoint.url];
  },
  commands: {
    replace: function replace(url, value) {
      url = url.replace(/#-?\d+$/, '');
      var history = state[url];

      if (!history) {
        console.warn('cannot replace. History not found');
        return;
      }

      if (history.cursor < history.history.length) {
        history.history.splice(history.cursor + 1);
      }

      history.history[history.cursor] = value;
      updateEndpoint(url);
      propagate(url);
    },
    undo: function undo(url, n) {
      if (n === void 0) {
        n = 1;
      }

      n = Math.floor(n * 1);
      var history = cleanUrlAndGetHistory(url, 'undo', n);

      if (!history) {
        return;
      }

      history.cursor = Math.max(0, history.cursor - n);
      updateEndpoint(url);
      propagate(url);
    },
    redo: function redo(url, n) {
      if (n === void 0) {
        n = 1;
      }

      n = Math.floor(n * 1);
      var history = cleanUrlAndGetHistory(url, 'redo', n);

      if (!history) {
        return;
      }

      history.cursor = Math.min(history.cursor + n, history.history.length - 1);
      updateEndpoint(url);
      propagate(url);
    },
    goto: function goto(url, n) {
      n = Math.floor(n * 1);
      var history = cleanUrlAndGetHistory(url, 'goto', n);

      if (!history) {
        return;
      }

      history.cursor = Math.max(0, Math.min(n, history.history.length - 1));
      updateEndpoint(url);
      propagate(url);
    },
    first: function first(url) {
      plugin$1.commands.undo(url, Infinity);
    },
    last: function last(url) {
      plugin$1.commands.redo(url, Infinity);
    },
    length: function length(url) {
      var history = cleanUrlAndGetHistory(url);

      if (!history) {
        return 0;
      }

      return history.history.length;
    },
    undoLength: function undoLength(url) {
      var history = cleanUrlAndGetHistory(url);

      if (!history) {
        return 0;
      }

      return history.cursor;
    },
    redoLength: function redoLength(url) {
      var history = cleanUrlAndGetHistory(url);

      if (!history) {
        return 0;
      }

      return history.history.length - history.cursor - 1;
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

function propagateUp(url) {
  var parentUrl = url.replace(/\.?[^.]*$/, '');

  if (!parentUrl) {
    return;
  }

  var endpoint = endpoints[parentUrl];

  if (endpoint) {
    endpoint.value = deepobject.getValue(state$1, endpoint.url);
    Object.values(endpoint.callbacks).forEach(function (cb) {
      return setTimeout(cb, 0, endpoint.value);
    });
  }

  setTimeout(propagateUp, 0, parentUrl);
}
/**
 * For each endpoint whose url is a child of url, if his value has changed, update it and call his callbacks
 *
 * dotted://foo.bar.buz is a parent of dotted://foo.bar
 * @param {string} url
 * @returns {undefined}
 */

function propagateDown(url) {
  var parent = endpoints[url];
  var prefix = url + ".";
  Object.keys(endpoints).forEach(function (childUrl) {
    if (!childUrl.startsWith(prefix)) {
      return;
    }

    var child = endpoints[childUrl];
    var newChildValue = deepobject.getValue(parent.value, childUrl.substr(url.length + 1));

    if (isDifferent(newChildValue, child.value)) {
      child.value = newChildValue;
      Object.values(child.callbacks).forEach(function (cb) {
        return setTimeout(cb, 0, newChildValue);
      });
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
  refresh: function refresh() {
    console.warn('the true source for this plugin is client side, so refresh does nothing');
  },

  /**
   * If the state has not value for this endpoint.url, creates a new updated state
   * else, set endpoint.value according to the state
   * @param {object} endpoint
   */
  getEndpoint: function getEndpoint(endpoint) {
    var actualValue = deepobject.getValue(state$1, endpoint.url);

    if (actualValue === undefined) {
      state$1 = deepobject.setValue(state$1, endpoint.url, endpoint.value);
      propagateUp(endpoint.url);
      propagateDown(endpoint.url);
      return;
    }

    endpoint.value = actualValue;
  },

  /**
   * Returns the value at the state
   * @param {string} url
   * @returns {object} the value
   */
  get: function get(url) {
    return deepobject.getValue(state$1, url);
  },

  /**
   * Updates the endpoint.value, and propagates up and down
   * @params {object} endpoint
   * @returns {undefined}
   */
  set: function set(endpoint) {
    state$1 = deepobject.setValue(state$1, endpoint.url, endpoint.value);
    propagateUp(endpoint.url);
    propagateDown(endpoint.url);
  },

  /**
   * If there is no children endpoint, delete the value, and propagate up
   * @param {object} endpoint
   * @returns {undefined}
   */
  clean: function clean(endpoint) {
    var prefix = endpoint.url + ".";

    if (Object.keys(endpoints).some(function (url) {
      return url.startsWith(prefix);
    })) {
      return;
    }

    propagateUp(endpoint.url);
  }
};

registerPlugin(plugin);
registerPlugin(localStorage$1);
registerPlugin(sessionStorate);
registerPlugin(plugin$1);
registerPlugin(dotted);

exports.command = command;
exports.conf = conf;
exports.endpoints = endpoints;
exports.get = get;
exports.onGet = onGet;
exports.plugins = plugins;
exports.refresh = refresh;
exports.registerPlugin = registerPlugin;
exports.set = set;
exports.useOnGet = useOnGet;

Object.defineProperty(exports, '__esModule', { value: true });

}));
