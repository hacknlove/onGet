'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

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

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};

  var target = _objectWithoutPropertiesLoose(source, excluded);

  var key, i;

  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }

  return target;
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

var ComResource = /*#__PURE__*/function (_VarResource) {
  _inherits(ComResource, _VarResource);

  var _super = _createSuper(ComResource);

  function ComResource(url) {
    var _this;

    var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        _ref$computation = _ref.computation,
        computation = _ref$computation === void 0 ? function () {
      return undefined;
    } : _ref$computation,
        _ref$urls = _ref.urls,
        urls = _ref$urls === void 0 ? [] : _ref$urls,
        options = _objectWithoutProperties(_ref, ["computation", "urls"]);

    var sharedContext = arguments.length > 2 ? arguments[2] : undefined;

    _classCallCheck(this, ComResource);

    _this = _super.call(this, url, options);
    _this.sharedContext = sharedContext;
    _this.crossSubcriptions = [];

    _this.addUrls(urls);

    _this.addComputation(computation);

    return _this;
  }

  _createClass(ComResource, [{
    key: "addUrls",
    value: function addUrls(urls) {
      var _this2 = this;

      this.urls = urls;
      this.crossSubcriptions.forEach(function (subscription) {
        return subscription();
      });
      this.crossSubcriptions = this.urls.map(function (url) {
        return _this2.sharedContext.onChange(url, _this2.recompute);
      });
    }
  }, {
    key: "addComputation",
    value: function addComputation(computation) {
      this.computation = computation;
      this.recompute();
    }
  }, {
    key: "recompute",
    value: function recompute(value, resource) {
      var newValue = this.computation(this.sharedContext.proxy, value, resource);

      if (newValue !== undefined) {
        this.value = newValue;
      }

      return newValue;
    }
  }, {
    key: "removeComputation",
    value: function removeComputation() {
      this.computation = function () {};
    }
  }]);

  return ComResource;
}(VarResource);

var ComPlugin = /*#__PURE__*/function () {
  function ComPlugin(sharedContext) {
    _classCallCheck(this, ComPlugin);

    this.sharedContext = sharedContext;
  }

  _createClass(ComPlugin, [{
    key: "newResource",
    value: function newResource(url, options) {
      return new ComResource(url, options, this.sharedContext);
    }
  }]);

  return ComPlugin;
}();
ComPlugin.protocol = 'com';

exports.ComResource = ComResource;
exports.default = ComPlugin;
