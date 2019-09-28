(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("@hacknlove/deepobject"), require("isdifferent"), require("react"));
	else if(typeof define === 'function' && define.amd)
		define("onGet", ["@hacknlove/deepobject", "isdifferent", "react"], factory);
	else if(typeof exports === 'object')
		exports["onGet"] = factory(require("@hacknlove/deepobject"), require("isdifferent"), require("react"));
	else
		root["onGet"] = factory(root["deepObject"], root["isDifferent"], root["React"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE__hacknlove_deepobject__, __WEBPACK_EXTERNAL_MODULE_isdifferent__, __WEBPACK_EXTERNAL_MODULE_react__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./plugins/fetch.js":
/*!**************************!*\
  !*** ./plugins/fetch.js ***!
  \**************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* global fetch */

const plugin = {
  name: 'fetch',
  regex: /^./,
  checkInterval: 30000,
  threshold: 500,
  async refresh (endpoint, eventHandler) {
    const response = await fetch(endpoint.url).catch(error => ({ error }))
    if (response.error) {
      return eventHandler(response.error)
    }
    eventHandler(await response.json().catch(async () => response.text()))
  }
}

/* harmony default export */ __webpack_exports__["default"] = (plugin);


/***/ }),

/***/ "./plugins/localstorage.js":
/*!*********************************!*\
  !*** ./plugins/localstorage.js ***!
  \*********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* global localStorage */
const PROTOCOLCUT = 'localStorage://'.length

/* harmony default export */ __webpack_exports__["default"] = ({
  name: 'localStorage',
  regex: /^localStorage:\/\/./i,
  checkInterval: 30000,
  threshold: 500,
  refresh (endpoint, eventHandler) {
    eventHandler(localStorage[endpoint.key])
  },
  getEndpoint (endpoint) {
    endpoint.key = endpoint.url.substr(PROTOCOLCUT)

    if (localStorage[endpoint.key] !== undefined) {
      endpoint.value = localStorage[endpoint.key]
      return
    }
    localStorage[endpoint.key] = endpoint.value
  },
  get (url) {
    return localStorage[url.substr(PROTOCOLCUT)]
  },
  set (endpoint) {
    localStorage[endpoint.key] = endpoint.value
  }
});


/***/ }),

/***/ "./plugins/sessionstorage.js":
/*!***********************************!*\
  !*** ./plugins/sessionstorage.js ***!
  \***********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* global sessionStorage */
const PROTOCOLCUT = 'sessionStorage://'.length

/* harmony default export */ __webpack_exports__["default"] = ({
  name: 'sessionStorage',
  regex: /^sessionStorage:\/\/./i,
  checkInterval: 30000,
  threshold: 500,
  refresh (endpoint, eventHandler) {
    eventHandler(sessionStorage[endpoint.key])
  },
  getEndpoint (endpoint) {
    endpoint.key = endpoint.url.substr(PROTOCOLCUT)

    if (sessionStorage[endpoint.key] !== undefined) {
      endpoint.value = sessionStorage[endpoint.key]
      return
    }
    sessionStorage[endpoint.key] = endpoint.value
  },
  get (url) {
    return sessionStorage[url.substr(PROTOCOLCUT)]
  },
  set (endpoint) {
    sessionStorage[endpoint.key] = endpoint.value
  }
});


/***/ }),

/***/ "./plugins/state.js":
/*!**************************!*\
  !*** ./plugins/state.js ***!
  \**************************/
/*! exports provided: propagateUp, propagateDown, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "propagateUp", function() { return propagateUp; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "propagateDown", function() { return propagateDown; });
/* harmony import */ var _hacknlove_deepobject__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @hacknlove/deepobject */ "@hacknlove/deepobject");
/* harmony import */ var _hacknlove_deepobject__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_hacknlove_deepobject__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var isdifferent__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! isdifferent */ "isdifferent");
/* harmony import */ var isdifferent__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(isdifferent__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _src_conf__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../src/conf */ "./src/conf.js");




var state = {}

/**
 * For each endpoint whose url is a parent of url, update his value and call his callbacks
 *
 * state://foo.bar is a parent of state://foo.bar.buz
 * @param {string} url
 * @returns {undefined}
 */
function propagateUp (url) {
  const parentUrl = url.replace(/\.?[^.]*$/, '')
  if (!parentUrl) {
    return
  }
  const endpoint = _src_conf__WEBPACK_IMPORTED_MODULE_2__["endpoints"][parentUrl]

  if (endpoint) {
    endpoint.value = Object(_hacknlove_deepobject__WEBPACK_IMPORTED_MODULE_0__["getValue"])(state, endpoint.url)
    Object.values(endpoint.callbacks).forEach(cb => setTimeout(cb, 0, endpoint.value))
  }
  setTimeout(propagateUp, 0, parentUrl)
}

/**
 * For each endpoint whose url is a child of url, if his value has changed, update it and call his callbacks
 *
 * state://foo.bar.buz is a parent of state://foo.bar
 * @param {string} url
 * @returns {undefined}
 */
function propagateDown (url) {
  const parent = _src_conf__WEBPACK_IMPORTED_MODULE_2__["endpoints"][url]
  const prefix = `${url}.`
  Object.keys(_src_conf__WEBPACK_IMPORTED_MODULE_2__["endpoints"]).forEach(childUrl => {
    if (!childUrl.startsWith(prefix)) {
      return
    }
    const child = _src_conf__WEBPACK_IMPORTED_MODULE_2__["endpoints"][childUrl]
    const newChildValue = Object(_hacknlove_deepobject__WEBPACK_IMPORTED_MODULE_0__["getValue"])(parent.value, childUrl.substr(url.length + 1))

    if (isdifferent__WEBPACK_IMPORTED_MODULE_1___default()(newChildValue, child.value)) {
      child.value = newChildValue
      Object.values(child.callbacks).forEach(cb => setTimeout(cb, 0, newChildValue))
    }
  })
}

/* harmony default export */ __webpack_exports__["default"] = ({
  name: 'state',
  regex: /^state:\/\/./,

  /**
   * Nothing to refresh. shows a warning in the console
   * @returns {undefined}
   */
  refresh () {
    console.warn('the true source for this plugin is client side, so refresh does nothing')
  },

  /**
   * If the state has not value for this endpoint.url, creates a new updated state
   * else, set endpoint.value according to the state
   * @param {object} endpoint
   */
  getEndpoint (endpoint) {
    const actualValue = Object(_hacknlove_deepobject__WEBPACK_IMPORTED_MODULE_0__["getValue"])(state, endpoint.url)
    if (actualValue === undefined) {
      state = Object(_hacknlove_deepobject__WEBPACK_IMPORTED_MODULE_0__["setValue"])(state, endpoint.url, endpoint.value)
      propagateUp(endpoint.url)
      propagateDown(endpoint.url)
      return
    }
    endpoint.value = actualValue
  },

  /**
   * Returns the value at the state
   * @param {string} url
   * @returns {object} the value
   */
  get (url) {
    return Object(_hacknlove_deepobject__WEBPACK_IMPORTED_MODULE_0__["getValue"])(state, url)
  },

  /**
   * Updates the endpoint.value, and propagates up and down
   * @params {object} endpoint
   * @returns {undefined}
   */
  set (endpoint) {
    state = Object(_hacknlove_deepobject__WEBPACK_IMPORTED_MODULE_0__["setValue"])(state, endpoint.url, endpoint.value)
    propagateUp(endpoint.url)
    propagateDown(endpoint.url)
  },

  /**
   * If there is no children endpoint, delete the value, and propagate up
   * @param {object} endpoint
   * @returns {undefined}
   */
  clean (endpoint) {
    const prefix = `${endpoint.url}.`
    if (Object.keys(_src_conf__WEBPACK_IMPORTED_MODULE_2__["endpoints"]).some(url => url.startsWith(prefix))) {
      return
    }
    propagateUp(endpoint.url)
  }
});


/***/ }),

/***/ "./src/addNewSubscription.js":
/*!***********************************!*\
  !*** ./src/addNewSubscription.js ***!
  \***********************************/
/*! exports provided: addNewSubscription */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "addNewSubscription", function() { return addNewSubscription; });
/* harmony import */ var _conf__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./conf */ "./src/conf.js");
/* harmony import */ var _createUnsubscribe__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./createUnsubscribe */ "./src/createUnsubscribe.js");



/**
 * Adds the callback to the endpoint, updates the min interval configuration, and returns the unsubscribe function
 * @param {string} url endpoint's url
 * @param {function} callback it will be called each time the value of the endpoint changes
 * @param {number} [interval] max interval (milliseconds) to check for a new value
 * @return {function} unsubscribe function
 */
function addNewSubscription (url, callback, interval) {
  const endpoint = _conf__WEBPACK_IMPORTED_MODULE_0__["endpoints"][url]

  var sk
  do {
    sk = Math.random().toString(36).substr(2) + (Date.now() % 1000).toString(36)
  } while (endpoint.callbacks[sk])
  endpoint.callbacks[sk] = callback

  if (endpoint.intervals) {
    interval = interval || endpoint.plugin.checkInterval
    endpoint.intervals[sk] = interval
    endpoint.minInterval = Math.min(endpoint.minInterval, interval)
  }

  return Object(_createUnsubscribe__WEBPACK_IMPORTED_MODULE_1__["createUnsubscribe"])(endpoint, sk)
}


/***/ }),

/***/ "./src/clean.js":
/*!**********************!*\
  !*** ./src/clean.js ***!
  \**********************/
/*! exports provided: clean */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "clean", function() { return clean; });
/* harmony import */ var _conf__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./conf */ "./src/conf.js");


/**
 * Cleans unused endpoints. The ones that has no callbacks, no method called recently.
 * It is  intended to be called each time a new endpoint is created
 */
function clean () {
  const values = Object.values(_conf__WEBPACK_IMPORTED_MODULE_0__["endpoints"])

  if (values.length < _conf__WEBPACK_IMPORTED_MODULE_0__["conf"].CACHE_SIZE) {
    return
  }

  values.forEach(endpoint => {
    if (!endpoint.clean) {
      if (Object.keys(endpoint.callbacks).length === 0) {
        endpoint.clean = true
      }
      return
    }
    if (endpoint.plugin.clean && endpoint.plugin.clean(endpoint)) {
      return
    }
    clearTimeout(_conf__WEBPACK_IMPORTED_MODULE_0__["endpoints"][endpoint.url].timeout)
    delete _conf__WEBPACK_IMPORTED_MODULE_0__["endpoints"][endpoint.url]
  })
}


/***/ }),

/***/ "./src/conf.js":
/*!*********************!*\
  !*** ./src/conf.js ***!
  \*********************/
/*! exports provided: conf, endpoints, plugins */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "conf", function() { return conf; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "endpoints", function() { return endpoints; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "plugins", function() { return plugins; });
const conf = {
  CACHE_SIZE: 100
}
const endpoints = {}
const plugins = []


/***/ }),

/***/ "./src/createUnsubscribe.js":
/*!**********************************!*\
  !*** ./src/createUnsubscribe.js ***!
  \**********************************/
/*! exports provided: createUnsubscribe */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createUnsubscribe", function() { return createUnsubscribe; });
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

    delete endpoint.callbacks[sk]
    if (endpoint.intervals) {
      delete endpoint.intervals[sk]
      endpoint.minInterval = Math.min(...Object.values(endpoint.intervals))
    }
  }
}


/***/ }),

/***/ "./src/findPlugin.js":
/*!***************************!*\
  !*** ./src/findPlugin.js ***!
  \***************************/
/*! exports provided: findPlugin */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "findPlugin", function() { return findPlugin; });
/* harmony import */ var _conf__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./conf */ "./src/conf.js");


/**
 * Internal: Returns the first plugin whose regex matchs the url
 * @param {string} url endpoint's url
 * @return plugin object
 */
function findPlugin (url) {
  return _conf__WEBPACK_IMPORTED_MODULE_0__["plugins"].find(plugin => url.match(plugin.regex))
}


/***/ }),

/***/ "./src/get.js":
/*!********************!*\
  !*** ./src/get.js ***!
  \********************/
/*! exports provided: get */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "get", function() { return get; });
/* harmony import */ var _findPlugin__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./findPlugin */ "./src/findPlugin.js");
/* harmony import */ var _conf__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./conf */ "./src/conf.js");



/**
 * Returns the cached value for the endpoint
 * @param {string} url url of the endpoint
 * @param {boolean} onlyCached=true, set to false to force the plugin to obtain a value if none if cached
 * @returns {any} whatever value is cached, or undefined, (or the obtained value if onlyCached = false)
 */
function get (url) {
  const endpoint = _conf__WEBPACK_IMPORTED_MODULE_1__["endpoints"][url]
  if (endpoint) {
    endpoint.clean = undefined
    return _conf__WEBPACK_IMPORTED_MODULE_1__["endpoints"][url].value
  }
  const plugin = Object(_findPlugin__WEBPACK_IMPORTED_MODULE_0__["findPlugin"])(url)
  if (!plugin.get) {
    return undefined
  }
  return plugin.get(url)
}


/***/ }),

/***/ "./src/getEndpoint.js":
/*!****************************!*\
  !*** ./src/getEndpoint.js ***!
  \****************************/
/*! exports provided: getEndpoint */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getEndpoint", function() { return getEndpoint; });
/* harmony import */ var _findPlugin__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./findPlugin */ "./src/findPlugin.js");
/* harmony import */ var _conf__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./conf */ "./src/conf.js");
/* harmony import */ var _clean__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./clean */ "./src/clean.js");




/**
 * Creates if needed and returns the object that stores the callbacks, configuration and state of an endpoint
 * @param {string} url endpoint's url
 * @params {any} [firstValue] is used as a firstValue, before any action was performed by the plugin
 * @returns {object} the endpoint
 */
function getEndpoint (url, firstValue) {
  if (_conf__WEBPACK_IMPORTED_MODULE_1__["endpoints"][url]) {
    return _conf__WEBPACK_IMPORTED_MODULE_1__["endpoints"][url]
  }
  setTimeout(_clean__WEBPACK_IMPORTED_MODULE_2__["clean"])
  const plugin = Object(_findPlugin__WEBPACK_IMPORTED_MODULE_0__["findPlugin"])(url)
  if (!plugin) {
    throw new Error(`No plugin for ${url}`)
  }
  const endpoint = {
    url,
    plugin,
    value: firstValue,
    callbacks: {}
  }
  _conf__WEBPACK_IMPORTED_MODULE_1__["endpoints"][url] = endpoint

  if (plugin.checkInterval) {
    endpoint.intervals = {}
    endpoint.minInterval = Infinity
  }

  if (plugin.threshold !== undefined) {
    endpoint.last = -Infinity
  }

  if (plugin.getEndpoint) {
    plugin.getEndpoint(endpoint)
  }

  return endpoint
}


/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! exports provided: onGet, useOnGet, set, refresh, get, registerPlugin, conf, endpoints, plugins */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _onGet__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./onGet */ "./src/onGet.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "onGet", function() { return _onGet__WEBPACK_IMPORTED_MODULE_0__["onGet"]; });

/* harmony import */ var _useOnGet__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./useOnGet */ "./src/useOnGet.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "useOnGet", function() { return _useOnGet__WEBPACK_IMPORTED_MODULE_1__["useOnGet"]; });

/* harmony import */ var _set__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./set */ "./src/set.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "set", function() { return _set__WEBPACK_IMPORTED_MODULE_2__["set"]; });

/* harmony import */ var _refresh__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./refresh */ "./src/refresh.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "refresh", function() { return _refresh__WEBPACK_IMPORTED_MODULE_3__["refresh"]; });

/* harmony import */ var _get__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./get */ "./src/get.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "get", function() { return _get__WEBPACK_IMPORTED_MODULE_4__["get"]; });

/* harmony import */ var _conf__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./conf */ "./src/conf.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "conf", function() { return _conf__WEBPACK_IMPORTED_MODULE_5__["conf"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "endpoints", function() { return _conf__WEBPACK_IMPORTED_MODULE_5__["endpoints"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "plugins", function() { return _conf__WEBPACK_IMPORTED_MODULE_5__["plugins"]; });

/* harmony import */ var _registerPlugin__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./registerPlugin */ "./src/registerPlugin.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "registerPlugin", function() { return _registerPlugin__WEBPACK_IMPORTED_MODULE_6__["registerPlugin"]; });

/* harmony import */ var _plugins_fetch__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../plugins/fetch */ "./plugins/fetch.js");
/* harmony import */ var _plugins_localstorage__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../plugins/localstorage */ "./plugins/localstorage.js");
/* harmony import */ var _plugins_sessionstorage__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../plugins/sessionstorage */ "./plugins/sessionstorage.js");
/* harmony import */ var _plugins_state__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../plugins/state */ "./plugins/state.js");













Object(_registerPlugin__WEBPACK_IMPORTED_MODULE_6__["registerPlugin"])(_plugins_fetch__WEBPACK_IMPORTED_MODULE_7__["default"])
Object(_registerPlugin__WEBPACK_IMPORTED_MODULE_6__["registerPlugin"])(_plugins_localstorage__WEBPACK_IMPORTED_MODULE_8__["default"])
Object(_registerPlugin__WEBPACK_IMPORTED_MODULE_6__["registerPlugin"])(_plugins_sessionstorage__WEBPACK_IMPORTED_MODULE_9__["default"])
Object(_registerPlugin__WEBPACK_IMPORTED_MODULE_6__["registerPlugin"])(_plugins_state__WEBPACK_IMPORTED_MODULE_10__["default"])




/***/ }),

/***/ "./src/onGet.js":
/*!**********************!*\
  !*** ./src/onGet.js ***!
  \**********************/
/*! exports provided: onGet */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "onGet", function() { return onGet; });
/* harmony import */ var _getEndpoint__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./getEndpoint */ "./src/getEndpoint.js");
/* harmony import */ var _addNewSubscription__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./addNewSubscription */ "./src/addNewSubscription.js");
/* harmony import */ var _refresh__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./refresh */ "./src/refresh.js");




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
  } = options
  const endpoint = Object(_getEndpoint__WEBPACK_IMPORTED_MODULE_0__["getEndpoint"])(url, first)

  const unsubscribe = Object(_addNewSubscription__WEBPACK_IMPORTED_MODULE_1__["addNewSubscription"])(url, cb, interval)
  endpoint.clean = undefined

  if (endpoint.value !== undefined) {
    cb(endpoint.value)
  }
  if (Date.now() - endpoint.last > endpoint.plugin.threshold) {
    Object(_refresh__WEBPACK_IMPORTED_MODULE_2__["refresh"])(url)
  }
  return unsubscribe
}


/***/ }),

/***/ "./src/pospone.js":
/*!************************!*\
  !*** ./src/pospone.js ***!
  \************************/
/*! exports provided: pospone */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "pospone", function() { return pospone; });
/* harmony import */ var _conf__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./conf */ "./src/conf.js");
/* harmony import */ var _refresh__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./refresh */ "./src/refresh.js");


/**
 * Pospone the refresh of the endpoint
 * @param {object} endpoint endpoint whose refresh should be posponed, as returned by getEndpoint(url)
 * @returns undefined
 */
function pospone (endpoint) {
  if (!endpoint.intervals) {
    return
  }
  clearTimeout(endpoint.timeout)
  if (!_conf__WEBPACK_IMPORTED_MODULE_0__["endpoints"][endpoint.url]) {
    return
  }
  endpoint.last = Date.now()
  endpoint.timeout = setTimeout(() => {
    Object(_refresh__WEBPACK_IMPORTED_MODULE_1__["refresh"])(endpoint.url)
  }, endpoint.minInterval)
}


/***/ }),

/***/ "./src/refresh.js":
/*!************************!*\
  !*** ./src/refresh.js ***!
  \************************/
/*! exports provided: refresh */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "refresh", function() { return refresh; });
/* harmony import */ var _conf__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./conf */ "./src/conf.js");
/* harmony import */ var _set__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./set */ "./src/set.js");
/* harmony import */ var _pospone__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./pospone */ "./src/pospone.js");




/**
 * Obtain the current value and is different, update the cache and call the handlers
 * @param {string} url of the endpoints to be refreshed
 * @returns {boolean} False if there is nothing to refresh, true otherwise
 */
function refresh (url) {
  const endpoint = _conf__WEBPACK_IMPORTED_MODULE_0__["endpoints"][url]
  if (!endpoint) {
    return false
  }
  endpoint.clean = undefined
  if (endpoint.plugin.threshold !== undefined && Date.now() - endpoint.last < endpoint.plugin.threshold) {
    return
  }
  Object(_pospone__WEBPACK_IMPORTED_MODULE_2__["pospone"])(endpoint)
  endpoint.plugin.refresh(endpoint, value => {
    Object(_set__WEBPACK_IMPORTED_MODULE_1__["set"])(url, value)
  })
  return true
}


/***/ }),

/***/ "./src/registerPlugin.js":
/*!*******************************!*\
  !*** ./src/registerPlugin.js ***!
  \*******************************/
/*! exports provided: registerPlugin */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "registerPlugin", function() { return registerPlugin; });
/* harmony import */ var _conf__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./conf */ "./src/conf.js");


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
  _conf__WEBPACK_IMPORTED_MODULE_0__["plugins"].unshift(plugin)
}


/***/ }),

/***/ "./src/set.js":
/*!********************!*\
  !*** ./src/set.js ***!
  \********************/
/*! exports provided: set */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "set", function() { return set; });
/* harmony import */ var isdifferent__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! isdifferent */ "isdifferent");
/* harmony import */ var isdifferent__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(isdifferent__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _conf__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./conf */ "./src/conf.js");
/* harmony import */ var _getEndpoint__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./getEndpoint */ "./src/getEndpoint.js");
/* harmony import */ var _pospone__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./pospone */ "./src/pospone.js");




/**
 * set a new cached value for an endpoint, and call the handlers. If the endpoint does not exists, it creates it.
 * @param {string} url  of the endpoint whose value set to
 * @param {any} value value to series
 * @param {boolean} doPospone=true if false do not pospone the closest refresh
 * @return {object} endpoint
 */

function set (url, value, doPospone) {
  const endpoint = _conf__WEBPACK_IMPORTED_MODULE_1__["endpoints"][url]

  if (!endpoint) {
    const endpoint = Object(_getEndpoint__WEBPACK_IMPORTED_MODULE_2__["getEndpoint"])(url, value)
    if (endpoint.plugin.set) {
      endpoint.value = value
      endpoint.plugin.set(endpoint)
    }
    return
  }

  endpoint.clean = undefined
  if (endpoint.intervals && doPospone) {
    Object(_pospone__WEBPACK_IMPORTED_MODULE_3__["pospone"])(endpoint)
  }
  if (!isdifferent__WEBPACK_IMPORTED_MODULE_0___default()(value, endpoint.value)) {
    return
  }

  endpoint.value = value
  if (endpoint.plugin.set) {
    endpoint.plugin.set(endpoint)
  }

  Object.values(endpoint.callbacks).forEach(cb => setTimeout(cb, 0, endpoint.value))
}


/***/ }),

/***/ "./src/useOnGet.js":
/*!*************************!*\
  !*** ./src/useOnGet.js ***!
  \*************************/
/*! exports provided: useOnGet */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "useOnGet", function() { return useOnGet; });
/* harmony import */ var _onGet__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./onGet */ "./src/onGet.js");
/* harmony import */ var _get__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./get */ "./src/get.js");



const { useState, useEffect } = __webpack_require__(/*! react */ "react")

/**
 * React hook that reload the component when the url's state change
 * @param {*} url the url to subscribe to
 * @param {*} first the first value to use, before the real one arrives
 */
function useOnGet (url, options) {
  const [value, set] = useState(() => Object(_get__WEBPACK_IMPORTED_MODULE_1__["get"])(url) || options.first)

  useEffect(() => {
    return Object(_onGet__WEBPACK_IMPORTED_MODULE_0__["onGet"])(url, set, options)
  }, [url])

  return value
}


/***/ }),

/***/ "@hacknlove/deepobject":
/*!*******************************************************************************************************************************************!*\
  !*** external {"commonjs":"@hacknlove/deepobject","commonjs2":"@hacknlove/deepobject","amd":"@hacknlove/deepobject","root":"deepObject"} ***!
  \*******************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE__hacknlove_deepobject__;

/***/ }),

/***/ "isdifferent":
/*!**************************************************************************************************************!*\
  !*** external {"commonjs":"isdifferent","commonjs2":"isdifferent","amd":"isdifferent","root":"isDifferent"} ***!
  \**************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_isdifferent__;

/***/ }),

/***/ "react":
/*!**************************************************************************************!*\
  !*** external {"commonjs":"react","commonjs2":"react","amd":"react","root":"React"} ***!
  \**************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_react__;

/***/ })

/******/ });
});
//# sourceMappingURL=onGet.js.map