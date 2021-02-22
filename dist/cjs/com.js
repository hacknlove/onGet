'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

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

class ComResource extends VarResource {
  constructor (url, { computation = () => undefined, urls = [], ...options } = {}, sharedContext) {
    super(url, options);
    this.sharedContext = sharedContext;
    this.crossSubcriptions = [];

    this.addUrls(urls);
    this.addComputation(computation);
  }

  addUrls (urls) {
    this.urls = urls;

    this.crossSubcriptions.forEach(subscription => subscription());

    this.crossSubcriptions = this.urls.map(url => this.sharedContext.onChange(url, this.recompute));
  }

  addComputation (computation) {
    this.computation = computation;
    this.recompute();
  }

  recompute (value, resource) {
    const newValue = this.computation(this.sharedContext.proxy, value, resource);

    if (newValue !== undefined) {
      this.value = newValue;
    }

    return newValue
  }

  removeComputation () {
    this.computation = () => {};
  }
}

class ComPlugin {
  constructor (sharedContext) {
    this.sharedContext = sharedContext;
  }

  newResource (url, options) {
    return new ComResource(url, options, this.sharedContext)
  }
}
ComPlugin.protocol = 'com';

exports.ComResource = ComResource;
exports.default = ComPlugin;
