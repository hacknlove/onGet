'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var deepobject = require('@hacknlove/deepobject');
var DeepProxy = require('proxy-deep');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var DeepProxy__default = /*#__PURE__*/_interopDefaultLegacy(DeepProxy);

function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

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

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;

  try {
    Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
    return true;
  } catch (e) {
    return false;
  }
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _possibleConstructorReturn(self, call) {
  if (call && (typeof call === "object" || typeof call === "function")) {
    return call;
  }

  return _assertThisInitialized(self);
}

function _createSuper(Derived) {
  var hasNativeReflectConstruct = _isNativeReflectConstruct();

  return function _createSuperInternal() {
    var Super = _getPrototypeOf(Derived),
        result;

    if (hasNativeReflectConstruct) {
      var NewTarget = _getPrototypeOf(this).constructor;

      result = Reflect.construct(Super, arguments, NewTarget);
    } else {
      result = Super.apply(this, arguments);
    }

    return _possibleConstructorReturn(this, result);
  };
}

function _superPropBase(object, property) {
  while (!Object.prototype.hasOwnProperty.call(object, property)) {
    object = _getPrototypeOf(object);
    if (object === null) break;
  }

  return object;
}

function _get(target, property, receiver) {
  if (typeof Reflect !== "undefined" && Reflect.get) {
    _get = Reflect.get;
  } else {
    _get = function _get(target, property, receiver) {
      var base = _superPropBase(target, property);

      if (!base) return;
      var desc = Object.getOwnPropertyDescriptor(base, property);

      if (desc.get) {
        return desc.get.call(receiver);
      }

      return desc.value;
    };
  }

  return _get(target, property, receiver || target);
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

var proxyHandlers = {
  get: function get(target, key) {
    var value = target === this.rootTarget ? target.cached[key] : target[key];

    if (_typeof(value) === 'object' && value !== null) {
      return this.nest({
        resource: target.resource
      });
    }

    return value;
  },
  deleteProperty: function deleteProperty() {
    this.rootTarget.plugin["delete"](this.rootTarget.url + '.' + this.path.join('.'));
  },
  set: function set(target, key, value) {
    this.rootTarget.plugin.setValue(this.rootTarget.url + '.' + this.path.join('.'), value);
    return true;
  }
};
var DotResource = /*#__PURE__*/function (_VarResource) {
  _inherits(DotResource, _VarResource);

  var _super = _createSuper(DotResource);

  function DotResource(url, options, plugin) {
    var _this;

    _classCallCheck(this, DotResource);

    _this = _super.call(this, url, options);
    _this.plugin = plugin;

    if (options.firstValue !== undefined && _this.value === undefined) {
      _this.value = options.firstValue;
    }

    return _this;
  }

  _createClass(DotResource, [{
    key: "setValue",
    value: function setValue(value) {
      this.plugin.setValue(this.url, value);
      this.cached = value;

      _get(_getPrototypeOf(DotResource.prototype), "triggerSubscriptions", this).call(this);
    }
  }, {
    key: "setChild",
    value: function setChild(url, value) {
      this.plugin.setValue(this.url + '.' + url, value);
    }
  }, {
    key: "getChild",
    value: function getChild(url) {
      return deepobject.getValue(this.cached, url);
    }
  }, {
    key: "delete",
    value: function _delete() {
      delete this.cached;
      this.plugin["delete"](this.url);
    }
  }, {
    key: "triggerSubscriptions",
    value: function triggerSubscriptions() {
      var _iterator = _createForOfIteratorHelper(this.subscriptions.values()),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var subscription = _step.value;
          subscription(this.cached, this);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }
  }, {
    key: "proxy",
    value: function proxy() {
      if (this.proxy) {
        return this.proxy;
      }

      this.proxy = new DeepProxy__default['default'](this, proxyHandlers);
    }
  }]);

  return DotResource;
}(VarResource);

var DotPlugin = /*#__PURE__*/function () {
  function DotPlugin(sharedState) {
    _classCallCheck(this, DotPlugin);

    this.sharedState = sharedState;
    this.state = {};
  }

  _createClass(DotPlugin, [{
    key: "newResource",
    value: function newResource(url, options) {
      return new DotResource(url, options, this);
    }
  }, {
    key: "getValue",
    value: function getValue(url) {
      return deepobject.getValue(this.state, url);
    }
  }, {
    key: "setValue",
    value: function setValue(url, value) {
      this.state = deepobject.setValue(this.state, url, value);
      this.propagateDown(url);
      this.propagateUp(url);
    }
  }, {
    key: "delete",
    value: function _delete(url) {
      this.state = deepobject.deleteValue(this.state, url);
      this.propagateUp(url);
      this.propagateDown(url);
    }
  }, {
    key: "propagateUp",
    value: function propagateUp(url) {
      var parentUrl = url.replace(/\.?[^.]*$/, '');

      if (!parentUrl) {
        return;
      }

      var resource = this.sharedState.resources.get(parentUrl);

      if (resource) {
        resource.triggerSubscriptions();
      }

      this.propagateUp(parentUrl);
    }
  }, {
    key: "propagateDown",
    value: function propagateDown(url) {
      var prefix = "".concat(url, ".");

      var _iterator2 = _createForOfIteratorHelper(this.sharedState.resources.values()),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var child = _step2.value;
          if (!child.url.startsWith(prefix)) continue;
          child.triggerSubscriptions();
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    }
  }]);

  return DotPlugin;
}();
DotPlugin.protocol = 'dot';

exports.DotResource = DotResource;
exports.default = DotPlugin;
