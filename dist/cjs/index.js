'use strict';

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(Object(source), true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

  return arr2;
}

function _createForOfIteratorHelper(o, allowArrayLike) {
  var it;

  if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) {
    if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
      if (it) o = it;
      var i = 0;

      var F = function () {};

      return {
        s: F,
        n: function () {
          if (i >= o.length) return {
            done: true
          };
          return {
            done: false,
            value: o[i++]
          };
        },
        e: function (e) {
          throw e;
        },
        f: F
      };
    }

    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  var normalCompletion = true,
      didErr = false,
      err;
  return {
    s: function () {
      it = o[Symbol.iterator]();
    },
    n: function () {
      var step = it.next();
      normalCompletion = step.done;
      return step;
    },
    e: function (e) {
      didErr = true;
      err = e;
    },
    f: function () {
      try {
        if (!normalCompletion && it.return != null) it.return();
      } finally {
        if (didErr) throw err;
      }
    }
  };
}

var VarResource = /*#__PURE__*/function () {
  function VarResource(url) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, VarResource);

    this.url = url;
    this.cached = options.firstValue;
    this.defaultValue = options.defaultValue;
    this.subscriptions = new Map();
    this.totalSubscriptionsCount = 0;
  }

  _createClass(VarResource, [{
    key: "setValue",
    value: function setValue(value) {
      this.cached = value;
      this.triggerSubscriptions();
    }
  }, {
    key: "getValue",
    value: function getValue() {
      var _this$cached;

      return (_this$cached = this.cached) !== null && _this$cached !== void 0 ? _this$cached : this.defaultValue;
    }
  }, {
    key: "triggerSubscriptions",
    value: function triggerSubscriptions() {
      var _iterator = _createForOfIteratorHelper(this.subscriptions.values()),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var subscription = _step.value;
          subscription(this.value, this);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }
  }, {
    key: "value",
    get: function get() {
      return this.getValue();
    },
    set: function set(value) {
      this.setValue(value);
    }
  }, {
    key: "onChange",
    value: function onChange(callback) {
      var _this = this;

      var key = this.totalSubscriptionsCount++;
      this.subscriptions.set(key, callback);
      return function () {
        return _this.subscriptions["delete"](key);
      };
    }
  }]);

  return VarResource;
}();

var VarPlugin = /*#__PURE__*/function () {
  function VarPlugin() {
    _classCallCheck(this, VarPlugin);
  }

  _createClass(VarPlugin, [{
    key: "newResource",
    value: function newResource(url, options) {
      return new VarResource(url, options);
    }
  }]);

  return VarPlugin;
}();
VarPlugin.protocol = 'var';

var defaultConf = {};
var proxyHandler = {
  get: function get(target, url) {
    return target.getValue(url);
  },
  deleteProperty: function deleteProperty(target, url) {
    target.deleteReource(url);
  },
  set: function set(target, url, value) {
    target.setValue(url, value);
    return true;
  }
};

var SharedState = /*#__PURE__*/function () {
  function SharedState(_ref) {
    var _this = this;

    var _ref$plugins = _ref.plugins,
        plugins = _ref$plugins === void 0 ? [] : _ref$plugins,
        _ref$conf = _ref.conf,
        conf = _ref$conf === void 0 ? {} : _ref$conf;

    _classCallCheck(this, SharedState);

    this.plugins = new Map(plugins.map(function (Plugin) {
      return [Plugin.protocol, new Plugin(_this)];
    }));

    if (!this.plugins.has('var')) {
      this.plugins.set('var', new VarPlugin(this));
    }

    this.conf = _objectSpread2(_objectSpread2({}, defaultConf), conf);
    this.resources = new Map();
    this.proxy = new Proxy(this, proxyHandler);
  }

  _createClass(SharedState, [{
    key: "findPlugin",
    value: function findPlugin(url) {
      return this.plugins.get(url.split(':', 1)) || this.plugins.get('var');
    }
  }, {
    key: "getResource",
    value: function getResource(url) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var resource = this.resources.get(url);

      if (resource) {
        return resource;
      }

      var plugin = this.findPlugin(url);
      resource = plugin.newResource(url, options, this);
      this.resources.set(url, resource);
      return resource;
    }
  }, {
    key: "getValue",
    value: function getValue(url) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return this.getResource(url, options).value;
    }
  }, {
    key: "setValue",
    value: function setValue(url, value) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var resource = this.getResource(url, options);
      resource.setValue(value, options);
    }
  }, {
    key: "deleteReource",
    value: function deleteReource(url) {
      var resource = this.getResource(url);
      resource["delete"]();
      this.resources["delete"](url);
    }
  }, {
    key: "onChange",
    value: function onChange(url, callback, options) {
      return this.getResource(url).onChange(callback, options);
    }
  }]);

  return SharedState;
}();

module.exports = SharedState;
