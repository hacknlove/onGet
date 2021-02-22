'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var deepobject = require('@hacknlove/deepobject');
var DeepProxy = require('proxy-deep');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var DeepProxy__default = /*#__PURE__*/_interopDefaultLegacy(DeepProxy);

class VarResource {
  constructor (url, options = {}) {
    this.url = url;
    this.cached = options.firstValue;
    this.defaultValue = options.defaultValue;
    this.subscriptions = new Map();
    this.totalSubscriptionsCount = 0;
  }

  setValue (value) {
    this.cached = value;
    this.triggerSubscriptions();
  }

  getValue () {
    return this.cached ?? this.defaultValue
  }

  triggerSubscriptions () {
    for (const subscription of this.subscriptions.values()) {
      subscription(this.value, this);
    }
  }

  get value () {
    return this.getValue()
  }

  set value (value) {
    this.setValue(value);
  }

  onChange (callback) {
    const key = this.totalSubscriptionsCount++;

    this.subscriptions.set(key, callback);
    return () => this.subscriptions.delete(key)
  }
}

const proxyHandlers = {
  get (target, key) {
    const value = target === this.rootTarget ? target.cached[key] : target[key];

    if (typeof value === 'object' && value !== null) {
      return this.nest({
        resource: target.resource
      })
    }
    return value
  },
  deleteProperty () {
    this.rootTarget.plugin.delete(this.rootTarget.url + '.' + this.path.join('.'));
  },
  set (target, key, value) {
    this.rootTarget.plugin.setValue(this.rootTarget.url + '.' + this.path.join('.'), value);
    return true
  }
};

class DotResource extends VarResource {
  constructor (url, options, plugin) {
    super(url, options);
    this.plugin = plugin;

    if (options.firstValue !== undefined && this.value === undefined) {
      this.value = options.firstValue;
    }
  }

  setValue (value) {
    this.plugin.setValue(this.url, value);
    this.cached = value;
    super.triggerSubscriptions();
  }

  setChild (url, value) {
    this.plugin.setValue(this.url + '.' + url, value);
  }

  getChild (url) {
    return deepobject.getValue(this.cached, url)
  }

  delete () {
    delete this.cached;
    this.plugin.delete(this.url);
  }

  triggerSubscriptions () {
    for (const subscription of this.subscriptions.values()) {
      subscription(this.cached, this);
    }
  }

  proxy () {
    if (this.proxy) {
      return this.proxy
    }
    this.proxy = new DeepProxy__default['default'](this, proxyHandlers);
  }
}

class DotPlugin {
  constructor (sharedState) {
    this.sharedState = sharedState;
    this.state = {};
  }

  newResource (url, options) {
    return new DotResource(url, options, this)
  }

  getValue (url) {
    return deepobject.getValue(this.state, url)
  }

  setValue (url, value) {
    this.state = deepobject.setValue(this.state, url, value);
    this.propagateDown(url);
    this.propagateUp(url);
  }

  delete (url) {
    this.state = deepobject.deleteValue(this.state, url);
    this.propagateUp(url);
    this.propagateDown(url);
  }

  propagateUp (url) {
    const parentUrl = url.replace(/\.?[^.]*$/, '');
    if (!parentUrl) {
      return
    }
    const resource = this.sharedState.resources.get(parentUrl);

    if (resource) {
      resource.triggerSubscriptions();
    }
    this.propagateUp(parentUrl);
  }

  propagateDown (url) {
    const prefix = `${url}.`;

    for (const child of this.sharedState.resources.values()) {
      if (!child.url.startsWith(prefix)) continue

      child.triggerSubscriptions();
    }
  }
}
DotPlugin.protocol = 'dot';

exports.DotResource = DotResource;
exports.default = DotPlugin;
