function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
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

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArrayLimit(arr, i) {
  if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
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

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
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

var ApiResource = /*#__PURE__*/function (_VarResource) {
  _inherits(ApiResource, _VarResource);

  var _super = _createSuper(ApiResource);

  function ApiResource(url, _ref, plugin) {
    var _this;

    var _ref$method = _ref.method,
        method = _ref$method === void 0 ? 'GET' : _ref$method,
        endpoint = _ref.endpoint,
        headers = _ref.headers,
        data = _ref.data,
        _ref$debounce = _ref.debounce,
        debounce = _ref$debounce === void 0 ? 0 : _ref$debounce,
        defaultError = _ref.defaultError,
        options = _objectWithoutProperties(_ref, ["method", "endpoint", "headers", "data", "debounce", "defaultError"]);

    _classCallCheck(this, ApiResource);

    _this = _super.call(this, url, options);
    _this.plugin = plugin;
    _this.fetchOptions = {
      method: method,
      endpoint: endpoint,
      headers: headers,
      defaultError: defaultError,
      data: data
    };
    _this.debounce = debounce;
    return _this;
  }

  _createClass(ApiResource, [{
    key: "endpoint",
    set: function set(url) {
      this.fetchOptions.endpoint = url;
      this.refresh();
    }
  }, {
    key: "headers",
    set: function set(headers) {
      this.fetchOptions.headers = headers;
      this.refresh();
    }
  }, {
    key: "method",
    set: function set(method) {
      this.fetchOptions.method = method;
      this.refresh();
    }
  }, {
    key: "data",
    set: function set(data) {
      this.fetchOptions.data = data;
      this.fetchOptions.body = JSON.stringify(data);
      this.refresh();
    }
  }, {
    key: "refresh",
    value: function () {
      var _refresh = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(debounce) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (this.debounced) {
                  clearTimeout(this.debounced);
                }

                if (!(debounce === 0)) {
                  _context.next = 7;
                  break;
                }

                _context.next = 4;
                return this.plugin.fetch(this.fetchOptions.endpoint, {
                  method: this.method,
                  headers: this.headers,
                  body: this.body,
                  defaultError: this.defaultValue
                });

              case 4:
                this.value = _context.sent;

                if (this.interval) {
                  setTimeout(this.refresh, this.interval, 0);
                }

                return _context.abrupt("return");

              case 7:
                this.debounced = setTimeout(this.refresh, debounce || this.debounce, 0);

              case 8:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function refresh(_x) {
        return _refresh.apply(this, arguments);
      }

      return refresh;
    }()
  }]);

  return ApiResource;
}(VarResource);

var ApiPlugin = /*#__PURE__*/function () {
  function ApiPlugin(sharedContext) {
    _classCallCheck(this, ApiPlugin);

    this.sharedContext = sharedContext;
    this.headers = {
      'content-type': 'application/json'
    };
    this.defaultError = {
      ok: false
    };
  }

  _createClass(ApiPlugin, [{
    key: "newResource",
    value: function newResource(url, options) {
      return new ApiResource(url, options, this);
    }
  }, {
    key: "fetch",
    value: function (_fetch) {
      function fetch(_x2, _x3) {
        return _fetch.apply(this, arguments);
      }

      fetch.toString = function () {
        return _fetch.toString();
      };

      return fetch;
    }( /*#__PURE__*/function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(url, options) {
        var _options$headers,
            _options$body,
            _this2 = this;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                return _context2.abrupt("return", fetch(url, {
                  headers: (_options$headers = options.headers) !== null && _options$headers !== void 0 ? _options$headers : this.headers,
                  body: (_options$body = options.body) !== null && _options$body !== void 0 ? _options$body : options.data !== undefined && JSON.stringify(this.data)
                }).then(function (res) {
                  return res.json();
                })["catch"](function () {
                  var _options$defaultError;

                  return (_options$defaultError = options.defaultError) !== null && _options$defaultError !== void 0 ? _options$defaultError : _this2.defaultError;
                }).then(function (data) {
                  if (data.onGetUpdate) {
                    Object.entries(data.onGetUpdate).forEach(function (_ref3) {
                      var _ref4 = _slicedToArray(_ref3, 2),
                          url = _ref4[0],
                          value = _ref4[1];

                      var __onGetOptions = value === null || value === void 0 ? void 0 : value.__onGetOptions;

                      if (__onGetOptions) {
                        delete value.__onGetOptions;
                      }

                      _this2.sharedContext.setValue(url, value, __onGetOptions);
                    });
                  }

                  return data;
                }));

              case 1:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      return function (_x4, _x5) {
        return _ref2.apply(this, arguments);
      };
    }())
  }]);

  return ApiPlugin;
}();
['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD', 'CONNECT', 'TRACE'].forEach(function (method) {
  return ApiPlugin.prototype[method] = function (url) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    return fetch(url, _objectSpread2({
      method: 'GET'
    }, options));
  };
});
ApiPlugin.protocol = 'api';

export default ApiPlugin;
export { ApiResource };
